import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bert_field_weight = True
nr_of_fields = 2
handler = None
is_model_ready = False