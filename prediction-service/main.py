from fastapi import FastAPI
import joblib
from pydantic import BaseModel

# Tải mô hình và vectorizer đã huấn luyện trước
model = joblib.load('category_predictor_model.joblib')
vectorizer = joblib.load('vectorizer.joblib')

# Khởi tạo FastAPI
app = FastAPI()

# Định nghĩa đầu vào của yêu cầu
class QueryRequest(BaseModel):
    search_query: str

# API để phân loại từ khóa tìm kiếm
@app.post("/predict")
async def predict_category(request: QueryRequest):
    query_vec = vectorizer.transform([request.search_query])
    category = model.predict(query_vec)
    return {"category": category[0]}
