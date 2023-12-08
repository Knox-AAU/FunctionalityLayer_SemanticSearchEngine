FROM python:3.10

RUN pip install torch numpy transformers 

WORKDIR /app

COPY "docker/python/BM25FBERT.py" /app/

CMD ["python3" , "BM25FBERT.py"]