"""
NAME    delete-all-indices.py
DESC    delete all indices used for gdc-mvs, so that we can start fresh with new data
USAGE   python3 delete-all-indices.py
NOTES
        1. connect to opensearch
        2. using AWS credentials
        3. then delete indices used for gdc-mvs
"""

import os
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth


def get_host_without_protocol_prefix():
    """gets opensearch domain from env variable, OPENSEARCH_HOST
       Will remove `https://` if it exists
       configuration for opensearch client requires domain without protocol https:// prefix
       OPENSEARCH_HOST='https://vpc-evstools-dev-abcdefg.us-east-1.es.amazonaws.com'
    """
    node = os.getenv('OPENSEARCH_HOST', '')
    node = node.replace("https://", "")
    node = node.replace("http://", "")
    return node


def connect_to_opensearch():
    """Connect to opensearch using AWS credentials and return client object"""
    # settings
    host = get_host_without_protocol_prefix()
    region = "us-east-1"
    service = "es"

    # credentials (using role built into EC2 instance)
    credentials = boto3.Session().get_credentials()
    auth = AWSV4SignerAuth(credentials, region, service)

    # create client - connected to instance, using settings
    client = OpenSearch(
        hosts=[{"host": host, "port": 443}],
        http_auth=auth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection,
        pool_maxsize=30,
    )

    return client


def check_connection(client):
    # Check if above command succeeded or not
    print(client.info())


def delete_gdc_suggestion(client):
    index='gdc-suggestion',
    if client.indices.exists(index=index):
      response = client.indices.delete(
        index='gdc-suggestion',
      )
      print('Deleting index:', response)


def delete_gdc_p(client):
    response = client.indices.delete(
        index='gdc-p'
    )
    print('Deleting index:', response)


if __name__ == '__main__':
    client = connect_to_opensearch()
    check_connection(client)

    delete_gdc_p(client)
    delete_gdc_suggestion(client)

    # close connection
    client.close()
