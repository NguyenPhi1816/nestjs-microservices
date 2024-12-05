type TUserActivity = {
  userId: number;
  activities: {
    productId: number;
    activityType: string; // PURCHASE, FAVORITE, CART, VIEW
    createdAt: string;
  }[];
};

type ProductScore = {
  productId: number;
  productScore: number;
};

const activityWeights: Record<string, number> = {
  PURCHASE: 1.0,
  FAVORITE: 0.8,
  CART: 0.6,
  VIEW: 0.2,
};

const k = 2; //k = number of nearest neighbors

function calculateProductScores(activities: TUserActivity[]) {
  const result: { userId: number; productScores: ProductScore[] }[] =
    activities.map((item) => {
      const productScores: ProductScore[] = [];

      item.activities.map((activity) => {
        const weight = activityWeights[activity.activityType] || 0;
        const score = weight;

        const existScore = productScores.find(
          (productScore) => productScore.productId === activity.productId,
        );

        if (!existScore) {
          productScores.push({
            productId: activity.productId,
            productScore: score,
          });

          return productScores;
        }

        existScore.productScore += score;
        return productScores;
      });

      return {
        userId: item.userId,
        productScores: productScores,
      };
    });

  return result;
}

function calculateTopProducts(
  userActivities: TUserActivity[],
  topN: number,
): number[] {
  const productScores: Record<number, number> = {};

  userActivities.forEach((userActivity) => {
    userActivity.activities.forEach((activity) => {
      const { productId, activityType } = activity;
      const weight = activityWeights[activityType] || 0;

      if (!productScores[productId]) {
        productScores[productId] = 0;
      }

      productScores[productId] += weight;
    });
  });

  const sortedProductScores = Object.entries(productScores)
    .map(([productId, productScore]) => ({
      productId: parseInt(productId, 10),
      productScore,
    }))
    .sort((a, b) => b.productScore - a.productScore);

  return sortedProductScores.slice(0, topN).map((item) => item.productId);
}

// Function to build the utility matrix
function buildUtilityMatrix(
  productScores: { userId: number; productScores: ProductScore[] }[],
  productIds: number[],
) {
  // Initialize an empty matrix
  const utilityMatrix: Record<number, Record<number, number>> = {};

  // Populate the matrix
  productScores.forEach((userEntry) => {
    const avgScore =
      userEntry.productScores.reduce(
        (prev, curr) => prev + curr.productScore,
        0,
      ) / userEntry.productScores.length;

    const { userId, productScores } = userEntry;
    // Initialize the user's row with default 0 scores
    utilityMatrix[userId] = productIds.reduce(
      (acc, productId) => {
        acc[productId] = 0;
        return acc;
      },
      {} as Record<number, number>,
    );

    // Update the scores for the user's products
    productScores.forEach(({ productId, productScore }) => {
      let myProductScore = productScore;

      if (productIds.includes(productId)) {
        myProductScore = myProductScore - avgScore;
      }

      utilityMatrix[userId][productId] = myProductScore;
    });
  });

  return utilityMatrix;
}

// Helper function to calculate cosine similarity between two vectors
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Return 0 similarity if one vector is all zeros
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Calculate user similarity matrix
function calculateUserSimilarityMatrix(vectors: number[][], userIds: string[]) {
  const numUsers = vectors.length;
  const similarityMatrix: Record<string, Record<string, number>> = {};

  for (let i = 0; i < numUsers; i++) {
    similarityMatrix[userIds[i]] = {};
    for (let j = 0; j < numUsers; j++) {
      if (i === j) {
        similarityMatrix[userIds[i]][userIds[j]] = 1; // Self-similarity is always 1
      } else {
        similarityMatrix[userIds[i]][userIds[j]] = calculateCosineSimilarity(
          vectors[i],
          vectors[j],
        );
      }
    }
  }

  return similarityMatrix;
}

function findKNearestUsers(
  userId: string,
  productId: string,
  utilityMatrix: Record<number, Record<number, number>>,
  similarityMatrix: Record<string, Record<string, number>>,
  k: number,
): { userId: string; similarity: number; normalizedScore: number }[] {
  // Get list users and similarity
  const similarities = Object.entries(similarityMatrix[userId])
    .filter(([otherUserId]) => {
      if (otherUserId === userId) return false; // Remove self-similarity

      // Check if the other user has at least one score != 0 in the utility matrix
      const userScore = utilityMatrix[otherUserId][productId];
      return userScore != 0;
    })
    .map(([otherUserId, similarity]) => {
      const normalizedScore = utilityMatrix[otherUserId][productId];

      return {
        userId: otherUserId,
        similarity,
        normalizedScore,
      };
    });

  // Sort by similarity desc
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Get k nearest users
  return similarities.slice(0, k);
}

// function findNormalizedScore()

function predictMissingScore(
  utilityMatrix: Record<number, Record<number, number>>,
  similarityMatrix: Record<string, Record<string, number>>,
) {
  for (const userId in utilityMatrix) {
    for (const productId in utilityMatrix[userId]) {
      if (utilityMatrix[userId][productId] === 0) {
        const simUsers: {
          userId: string;
          similarity: number;
          normalizedScore: number;
        }[] = findKNearestUsers(
          userId,
          productId,
          utilityMatrix,
          similarityMatrix,
          k,
        );

        const a = simUsers.reduce(
          (acc, simUser) => acc + simUser.similarity * simUser.normalizedScore,
          0,
        );
        const b = simUsers.reduce(
          (acc, simUser) => acc + Math.abs(simUser.similarity),
          0,
        );

        if (b === 0) {
          utilityMatrix[userId][productId] = 0;
          continue;
        }

        utilityMatrix[userId][productId] = a / b;
        continue;
      }
    }
  }
  return utilityMatrix;
}

export function getRecommendationProducts(
  userId: number,
  baseProductIds: number[],
  userActivities: TUserActivity[],
  limit: number = 10,
) {
  const calculatedProductScores = calculateProductScores(userActivities);

  const utilityMatrix = buildUtilityMatrix(
    calculatedProductScores,
    baseProductIds,
  );

  // Convert Utility Matrix to an array for easier processing
  const _userIds = Object.keys(utilityMatrix);
  const _productIds = Object.keys(utilityMatrix[_userIds[0]]);
  const _userVectors = _userIds.map((userId) =>
    _productIds.map((productId) => utilityMatrix[userId][productId]),
  );

  const userSimilarityMatrix = calculateUserSimilarityMatrix(
    _userVectors,
    _userIds,
  );

  const completedMatrix = predictMissingScore(
    utilityMatrix,
    userSimilarityMatrix,
  );

  if (userId != -1) {
    const userVector = completedMatrix[userId];
    const sortedVectorEntries = Object.entries(userVector).sort(
      ([, valueA], [, valueB]) => valueB - valueA,
    );
    const sortedVector = Object.fromEntries(sortedVectorEntries);

    // console.log(sortedVector);

    const recommendProductIds: number[] = Object.keys(sortedVector)
      .slice(0, limit)
      .map((id) => Number.parseInt(id));

    return recommendProductIds;
  } else {
    return calculateTopProducts(userActivities, limit);
  }
}
