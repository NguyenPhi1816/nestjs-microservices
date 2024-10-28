# Import các thư viện cần thiết
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report
import joblib
import random

# 1. Chuẩn bị dữ liệu mẫu
data = [
    {"searchQuery": "iphone", "category": "Điện thoại"},
    {"searchQuery": "samsung", "category": "Điện thoại"},
    {"searchQuery": "macbook", "category": "Laptop"},
    {"searchQuery": "dell", "category": "Laptop"},
    {"searchQuery": "quần jean", "category": "Thời trang"},
    {"searchQuery": "áo thun", "category": "Thời trang"},
    {"searchQuery": "android", "category": "Điện thoại"},
    {"searchQuery": "asus", "category": "Laptop"},
    {"searchQuery": "váy", "category": "Thời trang"},
    {"searchQuery": "smartphone", "category": "Điện thoại"},
    {"searchQuery": "laptop gaming", "category": "Laptop"},
    {"searchQuery": "đầm", "category": "Thời trang"},
]

# Các từ khóa cho từng danh mục
phone_keywords = [
    "iphone", "samsung", "android", "xiaomi", "nokia", "huawei", 
    "smartphone", "blackberry", "oppo", "realme", "vivo", "oneplus",
    "htc", "sony", "lg", "motorola"
]

laptop_keywords = [
    "macbook", "dell", "hp", "lenovo", "asus", "acer", 
    "msi", "razer", "surface", "thinkpad", "xps", "chromebook"
]

fashion_keywords = [
    "quần jean", "áo thun", "váy", "áo sơ mi", "đầm", "áo khoác", 
    "giày", "dép", "nón", "khăn", "đồ bơi", "thắt lưng"
]

# Tạo 200 mẫu dữ liệu
for _ in range(200):
    category = random.choice(["Điện thoại", "Laptop", "Thời trang"])
    if category == "Điện thoại":
        search_query = random.choice(phone_keywords)
    elif category == "Laptop":
        search_query = random.choice(laptop_keywords)
    else:
        search_query = random.choice(fashion_keywords)

    data.append({"searchQuery": search_query, "category": category})

# Kiểm tra dữ liệu
print(f"Số lượng dữ liệu sau khi thêm: {len(data)}")

# Chuyển đổi dữ liệu thành các danh sách
search_queries = [item["searchQuery"] for item in data]
categories = [item["category"] for item in data]

# 2. Tiền xử lý dữ liệu bằng CountVectorizer
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(search_queries)
y = categories

# 3. Chia dữ liệu thành tập huấn luyện và tập kiểm tra
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Khởi tạo và huấn luyện mô hình Naive Bayes
model = MultinomialNB()
model.fit(X_train, y_train)

# 5. Đánh giá mô hình
y_pred = model.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred))

# 6. Dự đoán danh mục từ từ khóa tìm kiếm
def predict_category(search_query):
    query_vec = vectorizer.transform([search_query])
    category = model.predict(query_vec)
    return category[0]

# Thử dự đoán một số từ khóa
print("Dự đoán cho 'iphone':", predict_category("iphone"))      # Kỳ vọng: "Điện thoại"
print("Dự đoán cho 'áo sơ mi':", predict_category("áo sơ mi"))  # Kỳ vọng: "Thời trang"

# 7. Lưu mô hình và vectorizer để sử dụng sau này
joblib.dump(model, 'category_predictor_model.joblib')
joblib.dump(vectorizer, 'vectorizer.joblib')

print("Model và vectorizer đã được lưu thành công!")
