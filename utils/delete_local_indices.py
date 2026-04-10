"""
connect to local opensearch
then delete indices used for gdc-mvs
"""

import os
import boto3
from opensearchpy import OpenSearch


def connect_to_opensearch():
    # settings
    host = 'localhost'
    port = 9200

    # connect to local opensearch instance, using settings
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


def delete_index(client, indexname):
    if client.indices.exists(index=indexname):
      response = client.indices.delete(
        index=indexname,
      )
      print('Deleting index {}:'.format(indexname), response)


if __name__ == '__main__':
    client = connect_to_opensearch()
    #check_connection(client)

    indices = ["gdc-suggestion", "gdc-p", "ncit-details"]
    for index in indices:
        delete_index(client, index)

    # close connection
    client.close()
