'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, CLUSTER } = require('zigbee-clusters');

const TuyaSpecificCluster = require('../../lib/TuyaSpecificCluster');
Cluster.addCluster(TuyaSpecificCluster);
const TuyaSpecificCluster = require('../../lib/TuyaSpecificBoundCluster');
Cluster.addCluster(TuyaSpecificBoundCluster);

class touch_dimmer_switch extends ZigBeeDevice {

    async onNodeInit({zclNode}) {

      this.printNode();

      // On/Off
      this.registerCapabilityListener('onoff', async (value) => {
        return this.writeBool(1, value);
      });

      // Dim
      this.registerCapabilityListener('dim', async (dim) => {
        if (dim===undefined) dim = this.getCapabilityValue('dim');
        return this.writeData32(3,dim*1000);
      });

      const node = await this.homey.zigbee.getNode(this);
      node.handleFrame = (endpointId, clusterId, frame, meta) => {
        this.log("EpId:", endpointId, " ClId:", clusterId, " Frame JSON data:", frame.toJSON(), " Meta:", meta);
      };

    }

    // Tuya Datapoint Functions
    _transactionID = 0;
    set transactionID(val) {
        this._transactionID = val % 256;
    }
    get transactionID() {
        return this._transactionID;
    }

    // Boolean
    async writeBool(dp, value) {
      const data = Buffer.alloc(1);
      data.writeUInt8(value ? 0x01 : 0x00,0);
      return this.zclNode.endpoints[1].clusters.tuya.datapoint({
          status: 0,
          transid: this.transactionID++,
          dp,
          datatype: 1,
          length: 1,
          data
      });
    }

    // int type value
    async writeData32 (dp, value) {
      const data = Buffer.alloc(4);
      data.writeUInt32BE(value,0);
      return this.zclNode.endpoints[1].clusters.tuya.datapoint({
          status: 0,
          transid: this.transactionID++,
          dp,
          datatype: 2,
          length: 4,
          data
      });
    }

    onDeleted(){
		this.log("Touch dimmer switch removed")
	}

}

module.exports = touch_dimmer_switch;

// Bit 0 = 
// Bit 1 = counter
// Bit 2 = datatype
// Bit 3 = status ?
// Bit 4 = transid
// Bit 5 = dp
// Bit 6 = 
// Bit 7 = 
// Bit 8 = length
// Bit 9 = value
// Bit 10 = value
// Bit 11 = value
// Bit 12 = value


// ON: [ 9, 46, 1, 0, 1, 1, 1, 0, 1, 1 ]
// OFF: [ 9, 43, 1, 0, 1, 1, 1, 0, 1, 0 ]
// DIM to min: [ 9, 77, 1, 0, 2, 2, 2, 0, 4, 0, 0, 0, 90 ] (min)
// DIM to max: [ 9, 50, 1, 0, 2, 2, 2, 0, 4, 0, 0, 3, 232 ] (max)

// DIM to min: [ 9, 123, 1, 0, 3, 2, 2, 0, 4, 0, 0, 0, 90 ] (min) (changed bit 4... why?)
// DIM while changing: [ 9, 121, 1, 0, 1, 2, 2, 0, 4, 0, 0, 1, 4 ]

// Sent ON: [ 8, 12, 11, 0, 0 ]
// Sent ON: [ 9, 17, 1, 0, 1, 1, 1, 0, 1, 1 ]

// Sent OFF: [ 8, 14, 11, 0, 0 ]
// Sent OFF: [ 9, 23, 1, 0, 1, 1, 1, 0, 1, 0 ]

// Sent DIM to max: [ 8, 15, 11, 0, 0 ]
// Sent DIM to max: [ 9, 27, 2, 0, 14, 3, 2, 0, 4, 0, 0, 3, 232 ]

// Sent DIM to min: [ 8, 18, 11, 0, 0 ]
// Sent DIM to min: [ 9, 28, 2, 0, 18, 3, 2, 0, 4, 0, 0, 0, 0 ]

/* "ids": {
    "modelId": "TS0601",
    "manufacturerName": "_TZE200_dfxkcots"
  },
  "endpoints": {
    "endpointDescriptors": [
      {
        "endpointId": 1,
        "applicationProfileId": 260,
        "applicationDeviceId": 81,
        "applicationDeviceVersion": 0,
        "_reserved1": 1,
        "inputClusters": [
          0,
          4,
          5,
          61184
        ],
        "outputClusters": [
          25,
          10
        ]
      }
    ],
    "endpoints": {
      "1": {
        "clusters": {
          "basic": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0,
                "name": "zclVersion",
                "value": 3,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 1,
                "name": "appVersion",
                "value": 66,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 2,
                "name": "stackVersion",
                "value": 0,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 3,
                "name": "hwVersion",
                "value": 1,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 4,
                "name": "manufacturerName",
                "value": "_TZE200_dfxkcots",
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 5,
                "name": "modelId",
                "value": "TS0601",
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 6,
                "name": "dateCode",
                "value": "",
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 7,
                "name": "powerSource",
                "value": "mains",
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "writable",
                  "reportable"
                ],
                "id": 65502,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 2,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65534,
                "name": "attributeReportingStatus",
                "value": "PENDING",
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65504,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65505,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65506,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65507,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              }
            ],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          },
          "groups": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0,
                "name": "nameSupport",
                "value": {
                  "type": "Buffer",
                  "data": [
                    0
                  ]
                },
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 2,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              }
            ],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          },
          "scenes": {
            "attributes": [
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 0,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 1,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 2,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 3,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 4,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 2,
                "reportingConfiguration": {
                  "status": "NOT_FOUND",
                  "direction": "reported"
                }
              }
            ],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          }
        },
        "bindings": {
          "ota": {
            "attributes": [],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          },
          "time": {
            "attributes": [],
            "commandsGenerated": "UNSUP_GENERAL_COMMAND",
            "commandsReceived": "UNSUP_GENERAL_COMMAND"
          }
        }
      }
    }
  } */