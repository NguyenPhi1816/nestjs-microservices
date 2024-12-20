import * as fs from 'fs';

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

type UserProductScores = { userId: number; productScores: ProductScore[] };

const outputFileName = 'recommendationMatrix.json';

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

function normalizeMinMaxCustom(
  users: UserProductScores[],
  minRange: number = 0.2,
  maxRange: number = 1,
): UserProductScores[] {
  return users.map((user) => {
    const scores = user.productScores.map((p) => p.productScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    return {
      userId: user.userId,
      productScores: user.productScores.map((p) => ({
        productId: p.productId,
        productScore:
          maxScore !== minScore
            ? minRange +
              ((p.productScore - minScore) * (maxRange - minRange)) /
                (maxScore - minScore)
            : 1, // Nếu max = min, gán 0
      })),
    };
  });
}

// Function to build the utility matrix
function buildUtilityMatrix(
  productScores: { userId: number; productScores: ProductScore[] }[],
  productIds: number[],
) {
  productScores = normalizeMinMaxCustom(productScores);

  // Initialize an empty matrix
  const utilityMatrix: Record<number, Record<number, number>> = {};

  // Populate the matrix
  productScores.forEach((userEntry) => {
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
  similarityMatrix: Record<string, Record<string, number>>,
  k: number,
): { userId: string; similarity: number }[] {
  // Get list users and similarity
  const similarities = Object.entries(similarityMatrix[userId])
    .filter(([otherUserId, score]) => {
      return otherUserId !== userId; // Remove self-similarity
    })
    .map(([otherUserId, similarity]) => {
      return {
        userId: otherUserId,
        similarity,
      };
    });

  // Sort by similarity desc
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Get k nearest users
  return similarities.slice(0, k);
}

function predictMissingScore(
  utilityMatrix: Record<number, Record<number, number>>,
  similarityMatrix: Record<string, Record<string, number>>,
) {
  for (const userId in utilityMatrix) {
    const simUsers: {
      userId: string;
      similarity: number;
    }[] = findKNearestUsers(userId, similarityMatrix, k);

    for (const productId in utilityMatrix[userId]) {
      if (utilityMatrix[userId][productId] === 0) {
        const a = simUsers.reduce((acc, simUser) => {
          const normalizedScore = utilityMatrix[simUser.userId][productId];
          return acc + simUser.similarity * normalizedScore;
        }, 0);
        const b = simUsers.reduce(
          (acc, simUser) => acc + Math.abs(simUser.similarity),
          0,
        );

        if (b === 0) {
          utilityMatrix[userId][productId] = 0;
          continue;
        }

        // Trừ giá trị đã dự đoán cho 1 để
        //    + Tăng độ ưu tiên cho các sản phẩm mà người dùng đã tương tác trong quá khứ
        //    + Giảm độ ưu tiên đối với các sản phẩm chưa được tương tác
        utilityMatrix[userId][productId] = a / b - 1;
        continue;
      }
    }
  }
  return utilityMatrix;
}

function saveJsonToFile(fileName: string, jsonData: object) {
  const jsonString = JSON.stringify(jsonData, null, 2);

  fs.writeFileSync(fileName, jsonString, 'utf8');
}

function readJsonFromFile(fileName: string) {
  const data = fs.readFileSync(fileName, 'utf8');
  const jsonData = JSON.parse(data);
  return jsonData;
}

export function calcRecommendationData(
  baseProductIds: number[],
  userActivities: TUserActivity[],
) {
  const calculatedProductScores = calculateProductScores(userActivities);

  const utilityMatrix = buildUtilityMatrix(
    calculatedProductScores,
    baseProductIds,
  );

  const _utilityMatrix = JSON.stringify(utilityMatrix);

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

  saveJsonToFile(outputFileName, {
    calculatedProductScores,
    utilityMatrix: JSON.parse(_utilityMatrix),
    userSimilarityMatrix,
    completedMatrix,
  });

  return completedMatrix;
}

export function getRecommendationProducts(
  userId: number,
  userActivities: TUserActivity[],
  limit: number = 10,
) {
  if (userId != -1) {
    const completedMatrix = readJsonFromFile(outputFileName)
      .completedMatrix as Record<number, Record<number, number>>;

    const userVector = completedMatrix[userId];
    const sortedVectorEntries = Object.entries(userVector).sort(
      ([, valueA], [, valueB]) => valueB - valueA,
    );

    const recommendProductIds: number[] = sortedVectorEntries
      .map((item) => Number.parseInt(item[0]))
      .slice(0, limit);

    return recommendProductIds;
  } else {
    return calculateTopProducts(userActivities, limit);
  }
}

export function checkUserRecommendationAvailable(userId: number) {
  const completedMatrix = readJsonFromFile(outputFileName)
    .completedMatrix as Record<number, Record<number, number>>;

  const userVector = completedMatrix[userId];
  return userVector && Object.keys(userVector).length > 0;
}

export function getMatrixData() {
  const completedMatrix = readJsonFromFile(outputFileName)
    .completedMatrix as Record<number, Record<number, number>>;
  return completedMatrix;
}
