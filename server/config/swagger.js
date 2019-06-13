module.exports = {
  'swagger': '2.0',
  'info': {
    'version': '1.3.0',
    'title': 'GDCMVS Rest API',
    'description': 'https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1'
  },
  'host': 'https://gdc-mvs-dev.nci.nih.gov/gdc',
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
          'The **keyword** paramater is used to enter the term or phrase to use in the search.\n' +
          '# Options\n' +
          'The options paramater is used to enter a custom search.\n' +
          'Valid entries for options specifications are: partial or **exact**, **syn**, **desc**. \n' +
          'The **partial** (default) or **exact** is used for search the partial o exact term specified in kerword. \n' +
          'The **syn** is used for include the synomnyms matches in the search. \n' +
          'The **desc** is used for include the propertied descruption matches in the search. \n' +
          '| Example | URL |\n' +
          '|---|---|\n' +
          '| will return concepts for the term melanoma. | [search?keyword=melanoma](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma)|\n' +
          '| will return concepts for the partial term melanoma. | [search?keyword=melanoma&options=partial](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=partial)|\n' +
          '| will return concepts for the exact term melanoma.  | [search?keyword=melanoma&options=exact](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=exact)|\n' +
          '| will return concepts for the partial term melanoma and synonyms. | [search?keyword=melanoma&options=partial,syn](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=partial,syn)|\n' +
          '| will return concepts for the partial term melanoma, synonyms and property description matches. | [search?keyword=melanoma&options=partial,syn,desc](https://gdc-mvs-dev.nci.nih.gov/gdc/api/v1/search?keyword=melanoma&options=partial,syn,desc)|\n',
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
            'description': 'Successfully got terms',
            'schema': {
              '$ref': '#/definitions/terms'
            }
          }
        }
      }
    }
  },
  'definitions': {
    'terms': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/term'
      }
    },
    'term': {
      'properties': {
        '_source': {
          '$ref': '#/definitions/_source'
        },
        'highlight': {
          '$ref': '#/definitions/highlight'
        },
        'inner_hits': {
          '$ref': '#/definitions/inner_hits'
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
        'node_desc': {
          'type': 'string'
        },
        'category': {
          'type': 'string'
        },
        'property_desc': {
          'type': 'string'
        },
        'type': {
          'type': 'string'
        },
        'id': {
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
        'v': {
          'type': 'string'
        },
        'url': {
          'type': 'string'
        }
      }
    },
    '_highlight': {
      'properties': {
        'property.have': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'property': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'property_desc': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'cde.id': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'id': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        }
      }
    },
    'inner_hits': {
      'properties': {
        'enums': {
          '$ref': '#/definitions/enums'
        }
      }
    },
    'enums': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/enum'
      }
    },
    'enum': {
      'properties': {
        'id': {
          'type': 'string'
        },
        'highlight': {
          '$ref': '#/definitions/highlight'
        },
        'match': {
          '$ref': '#/definitions/match'
        }
      }
    },
    'highlight': {
      'properties': {
        'enum.n.have': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'enum.n': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'enum.n_syn.n_c.have': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'enum.n_syn.n_c': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'enum.n_syn.s.termName.have': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'enum.n_syn.s.termName': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'enum.i_c.have': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        },
        'enum.i_c.c': {
          'type': 'array',
          'items': {
            'type': 'string'
          }
        }
      }
    },
    'match': {
      'properties': {
        'n': {
          'type': 'string'
        },
        'gdc_d': {
          'type': 'boolean'
        },
        'n_syn': {
          '$ref': '#/definitions/n_syns'
        }
      }
    },
    'n_syns': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/n_syn'
      }
    },
    'n_syn': {
      'properties': {
        'n_c': {
          'type': 'string'
        },
        's': {
          '$ref': '#/definitions/syns'
        }
      }
    },
    'syns': {
      'type': 'array',
      'items': {
        '$ref': '#/definitions/syn'
      }
    },
    'syn': {
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
  }
};
