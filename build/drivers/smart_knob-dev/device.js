'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class smart_knob extends ZigBeeDevice {

    async onNodeInit({zclNode}) {

      this.printNode();

  		if (this.isFirstInit()){
  			await this.configureAttributeReporting([
  				{
  					endpointId: 1,
  					cluster: CLUSTER.POWER_CONFIGURATION,
  					attributeName: 'batteryPercentageRemaining',
  					minInterval: 65535,
  					maxInterval: 0,
  					minChange: 1,
  				}
  			]);
  		}

      // measure_battery // alarm_battery
      zclNode.endpoints[1].clusters[CLUSTER.POWER_CONFIGURATION.NAME]
      .on('attr.batteryPercentageRemaining', this.onBatteryPercentageRemainingAttributeReport.bind(this));

      var debounce = 0;
      const node = await this.homey.zigbee.getNode(this);
      node.handleFrame = (endpointId, clusterId, frame, meta) => {
        if (clusterId === 6) {
          this.buttonCommandParser();
        }

        if (clusterId === 768) {
          debounce = debounce+1;
          if (debounce===1){
            this.buttonLongCommandParser();
          }
        } else {
          debounce=0;
        }

        if (clusterId === 8) {
          this.turnCommandParser(frame);
        }

        if (clusterId !== 6 && clusterId !== 8 && clusterId !== 768) {
          this.log("endpointId:", endpointId,", clusterId:", clusterId,", frame:", frame, ", meta:", meta);
          this.log("Frame JSON data:", frame.toJSON());
        }
      };

      this._buttonPressedTriggerDevice = this.homey.flow.getDeviceTriggerCard('smart_knob')
      .registerRunListener(async (args, state) => {
        return (null, args.action === state.action);
      });
    }

    buttonCommandParser() {
      var action = 'oneClick';
      return this._buttonPressedTriggerDevice.trigger(this, {}, { action: `${action}` })
      .then(() => this.log(`Triggered Smart Knob, action=${action}`))
      .catch(err => this.error('Error triggering Smart Knob', err));
    }

    buttonLongCommandParser() {
      var action = 'longClick';
      return this._buttonPressedTriggerDevice.trigger(this, {}, { action: `${action}` })
      .then(() => this.log(`Triggered Smart Knob, action=${action}`))
      .catch(err => this.error('Error triggering Smart Knob', err));
    }

    turnCommandParser(frame) {
      var action = frame[3] === 0 ? 'turnRight' : 'turnLeft';
      return this._buttonPressedTriggerDevice.trigger(this, {}, { action: `${action}` })
      .then(() => this.log(`Triggered Smart Knob, action=${action}`))
      .catch(err => this.error('Error triggering Smart Knob', err));
    }

    onBatteryPercentageRemainingAttributeReport(batteryPercentageRemaining) {
    	const batteryThreshold = this.getSetting('batteryThreshold') || 20;
    	this.log("measure_battery | powerConfiguration - batteryPercentageRemaining (%): ", batteryPercentageRemaining/2);
    	this.setCapabilityValue('measure_battery', batteryPercentageRemaining/2);
    	this.setCapabilityValue('alarm_battery', (batteryPercentageRemaining/2 < batteryThreshold) ? true : false)
    }

    onDeleted(){
		this.log("Smart Knob removed")
	}

}

module.exports = smart_knob;


/* 
"ids": {
  "modelId": "TS004F",
  "manufacturerName": "_TZ3000_4fjiwweb"
},
"endpoints": {
  "endpointDescriptors": [
    {
      "endpointId": 1,
      "applicationProfileId": 260,
      "applicationDeviceId": 260,
      "applicationDeviceVersion": 0,
      "_reserved1": 1,
      "inputClusters": [
        0,
        1,
        3,
        4,
        6,
        4096
      ],
      "outputClusters": [
        25,
        10,
        3,
        4,
        5,
        6,
        8,
        4096
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
              "value": 67,
              "reportingConfiguration": {
                "direction": "reported",
                "attributeDataType": 32,
                "minInterval": 1,
                "maxInterval": 65534,
                "minChange": 0,
                "status": "SUCCESS"
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
              "value": "_TZ3000_4fjiwweb",
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
              "value": "TS004F",
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
              "value": "battery",
              "reportingConfiguration": {
                "status": "NOT_FOUND",
                "direction": "reported"
              }
            },
            {
              "acl": [
                "readable",
                "writable", "reportable"
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
        "powerConfiguration": {
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
              "id": 32,
              "name": "batteryVoltage",
              "value": 30,
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
              "id": 33,
              "name": "batteryPercentageRemaining",
              "value": 200,
              "reportingConfiguration": {
                "direction": "reported",
                "attributeDataType": 32,
                "minInterval": 14400,
                "maxInterval": 65534,
                "minChange": 10,
                "status": "SUCCESS"
              }
            },
            {
              "acl": [
                "readable",
                "reportable"
              ],
              "id": 65533,
              "name": "clusterRevision",
              "value": 1,
              "reportingConfiguration": {
                "status": "NOT_FOUND",
                "direction": "reported"
              }
            }
          ],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "identify": {
          "attributes": [
            {
              "acl": [
                "readable",
                "writable",
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
              "id": 65533,
              "name": "clusterRevision",
              "value": 1,
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
              "value": 1,
              "reportingConfiguration": {
                "status": "NOT_FOUND",
                "direction": "reported"
              }
            }
          ],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "onOff": {
          "attributes": [
            {
              "acl": [
                "readable",
                "writable",
                "reportable"
              ],
              "id": 32772,
              "reportingConfiguration": {
                "status": "NOT_FOUND",
                "direction": "reported"
              }
            }
          ],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "touchlink": {
          "attributes": [
            {
              "acl": [
                "readable",
                "reportable"
              ],
              "id": 65533,
              "name": "clusterRevision",
              "value": 1,
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
        "identify": {
          "attributes": [
            {
              "acl": [
                "readable",
                "writable",
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
              "id": 65533,
              "name": "clusterRevision",
              "value": 1,
              "reportingConfiguration": {
                "status":
                "NOT_FOUND",
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
              "value": 1,
              "reportingConfiguration": {
                "status": "NOT_FOUND",
                "direction": "reported"
              }
            }
          ],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "onOff": {
          "attributes": [
            {
              "acl": [
                "readable",
                "writable",
                "reportable"
              ],
              "id": 32772,
              "reportingConfiguration": {
                "status": "NOT_FOUND",
                "direction": "reported"
              }
            }
          ],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "touchlink": {
          "attributes": [
            {
              "acl": [
                "readable",
                "reportable"
              ],
              "id": 65533,
              "name": "clusterRevision",
              "value": 1,
              "reportingConfiguration": {
                "status": "NOT_FOUND",
                "direction": "reported"
              }
            }
          ],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "ota": {
          "attributes": [],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "time": {
          "attributes": [],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "scenes": {
          "attributes": [],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        },
        "levelControl": {
          "attributes": [],
          "commandsGenerated": "UNSUP_GENERAL_COMMAND",
          "commandsReceived": "UNSUP_GENERAL_COMMAND"
        }
      }
    }
  }
}
     */  