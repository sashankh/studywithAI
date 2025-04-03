FROM python:3.12

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create .env file from environment variables
RUN echo "AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY" > .env && \
    echo "AZURE_OPENAI_API_BASE=$AZURE_OPENAI_API_BASE" >> .env && \
    echo "AZURE_OPENAI_API_VERSION=$AZURE_OPENAI_API_VERSION" >> .env && \
    echo "AZURE_OPENAI_DEPLOYMENT_NAME=$AZURE_OPENAI_DEPLOYMENT_NAME" >> .env

# Add gunicorn for production-ready deployment
RUN pip install gunicorn

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]