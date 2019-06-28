module.exports = {
  'swagger': '2.0',
  'info': {
    'version': '1.3.0',
    'title': 'GDCMVS Rest API',
    'description': 'https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1'
  },
  'host': 'gdc-mvs-dev.nci.nih.gov/gdc',
  'basePath': '/api/v1',
  'tags': [
    {
      'name': 'Search endpoint',
      'description': 'Search Controller'
    }
  ],
  'schemes': [
    'https'
  ],
  'consumes': [
    'application/json'
  ],
  'produces': [
    'application/json'
  ],
  'paths': {
    '/search': {
      'get': {
        'tags': ['Search endpoint'],
        'summary': 'Search Description Summary',
        'description': '# Keyword\n' +
          'The **keyword** paramater is used to enter the term or phrase to in search.\n' +
          '# Options\n' +
          'The options paramater is used to perform a custom search.\n' +
          'Valid entries for options specifications are: **partial** or **exact**, **syn**, **desc**. \n' +
          '\n' +
          'The **partial** is **default** search option, It is not necessary to specify it \n' +
          'The **exact** is used to perform exact search for term or phrase specified in keyword. \n' +
          'The **syn** is used to perform search in synonyms for term or phrase specified in keyword. \n' +
          'The **desc** is used to perform search in property description for term or phrase specified in keyword. \n' +
          '| Example | URL |\n' +
          '|---|---|\n' +
          '| will perform partial search in enums, ICDO-3 code, NCIt code and property name and return data that partially matches **melanoma**. | [search?keyword=melanoma](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma)|\n' +
          '| will perform partial search in enums, ICDO-3 code, NCIt code and property name and return data associated with ICDO-3 code **8000/6**. | [search?keyword=8000/6](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=8000/6)|\n' +
          '| will perform partial search in enums, ICDO-3 code, NCIt code and property name and return data associated with NCIt concept code **C12434**. | [search?keyword=c12434](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=c12434)|\n' +
          '| will perform partial search in enums, ICDO-3 code, NCIt code and property name and return data that partially matches **primary_diagnosis**. | [search?keyword=primary_diagnosis](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=primary_diagnosis)|\n' +
          '| | |\n' +
          
          '| will perform partial search in enums, ICDO-3 code, NCIt code and property name and return data that partially matches melanoma.. | [search?keyword=melanoma&options=partial](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=partial)|\n' +
          '| will perform exact search in enums, ICDO-3 code, NCIt code and property name and return data that exactly matches melanoma..  | [search?keyword=melanoma&options=exact](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=exact)|\n' +
          '| will perform partial search in enums, ICDO-3 code, NCIt code, property name and Synonyms and return data that partially matches amelanoma.. | [search?keyword=melanoma&options=partial,syn](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=partial,syn)|\n' +
          '| will perform partial search in enums, ICDO-3 code, NCIt code, property name and Synonyms and property description and return data that partially matches melanoma. property description matches. | [search?keyword=melanoma&options=partial,syn,desc](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=partial,syn,desc)|\n',
        'parameters': [
          {
            'name': 'keyword',
            'in': 'query',
            'required': true,
            'description': 'The term/phrase to be searched',
            'type': 'string'
          }, {
            'name': 'options',
            'in': 'query',
            'description': 'The options specifications are: partial or exact, syn, desc.',
            'type': 'string'
          }
        ],
        'responses': {
          '200': {
            'description': 'Success',
            'schema': {
              '$ref': '#/definitions/results'
            }
          },
          '404': {
            'description': 'The resource you were trying to reach is not found'
          }
        }
      }
    }
  },
  'definitions': {
    'results': {
      'type': 'array',
      'items': {
        'properties': {
          '_source': {
            '$ref': '#/definitions/_source'
          },
          'matches': {
            '$ref': '#/definitions/matches'
          }
        }
      }
    },
    '_source': {
      'properties': {
        'property': {
          'type': 'string'
        },
        'node': {
          'type': 'string'
        },
        'nodeDescription': {
          'type': 'string'
        },
        'category': {
          'type': 'string'
        },
        'propertyDescription': {
          'type': 'string'
        },
        'type': {
          'type': 'string'
        },
        'cde': {
          '$ref': '#/definitions/cde'
        }
      }
    },
    'cde': {
      'properties': {
        'id': {
          'type': 'string'
        },
        'url': {
          'type': 'string'
        }
      }
    },
    'matches': {
      'type': 'array',
      'items': {
        'properties': {
          'value': {
            'type': 'string'
          },
          'icdo3Code': {
            'type': 'string'
          },
          'allSynonyms': {
            '$ref': '#/definitions/allSynonyms'
          },
          'icdo3Strings': {
            '$ref': '#/definitions/icdo3Strings'
          }
        }
      }
    },
    'allSynonyms': {
      'type': 'array',
      'items': {
        'properties': {
          'conceptCode': {
            'type': 'string'
          },
          'synonyms': {
            '$ref': '#/definitions/synonyms'
          }
        }
      }
    },
    'synonyms': {
      'type': 'array',
      'items': {
        'properties': {
          'termName': {
            'type': 'string'
          },
          'termGroup': {
            'type': 'string'
          },
          'termSource': {
            'type': 'string'
          }
        }
      }
    },
    'icdo3Strings': {
      'type': 'array',
      'items': {
        'properties': {
          'value': {
            'type': 'string'
          },
          'termGroup': {
            'type': 'string'
          }
        }
      }
    }
  }
};
