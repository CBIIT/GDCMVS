"""
connect to local opensearch
then delete indices used for gdc-mvs
"""

import os

import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth


def connect_to_opensearch():
    # settings
    host = 'localhost'
    port = 9200

    # create client
    # connect client to instance, using settings
    client = OpenSearch(
        hosts=[{'host': host, "port": port}],
        use_ssl=False,
        verify_certs=False,
        ssl_show_warn=False
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
