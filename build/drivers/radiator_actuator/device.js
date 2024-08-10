'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster, debug, CLUSTER } = require('zigbee-clusters');

const TuyaSpecificCluster = require('../../lib/TuyaSpecificCluster');
const TuyaSpecificBoundCluster = require('../../lib/TuyaSpecificBoundCluster');
Cluster.addCluster(TuyaSpecificCluster);
Cluster.addCluster(TuyaSpecificBoundCluster);

class radio_actuator extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
        
    this.printNode();

    this.log("Triggering reports: ", await this.zclNode.endpoints[1].clusters.basic.readAttributes('manufacturerName', 'zclVersion', 'appVersion', 'modelId', 'powerSource', 'attributeReportingStatus'));

    // Handler for Target Temperature
    this.registerCapabilityListener('target_temperature', async (value) => {
      this.log("target_temperature: ", value);
      this.setCapabilityValue('target_temperature',value);
      await this.writeData32(103,value*10);
    });

    this.registerCapabilityListener("onoff", async (value) => {
      this.log("onoff: ", value);
      await this.writeBool(101,value);
      if (value) {
        const target_temperature = this.getCapabilityValue('target_temperature');
        this.log("target_temperature: ", target_temperature);
        await this.writeData32(103,target_temperature*10);
        }
    });

    const node = await this.homey.zigbee.getNode(this);
    node.handleFrame = (endpointId, clusterId, frame, meta) => {
      if (clusterId === 61184 && frame[5] === 103) {
        this.log("Changed on the value to temperature:", frame[12]/10);
        if (this.getCapabilityValue('target_temperature') != frame[12]/10){
          this.log("Different:", frame[12]/10," vs", this.getCapabilityValue('target_temperature'));
          this.setCapabilityValue('target_temperature',frame[12]/10);
        }
      }
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

  async onAdded(){
      // this.log("Triggering reports: ", await this.zclNode.endpoints[1].clusters.basic.readAttributes('manufacturerName', 'zclVersion', 'appVersion', 'modelId', 'powerSource', 'attributeReportingStatus'));
  }

  onDeleted(){
    this.log("Radio Actuator removed")    
  }

}

module.exports = radio_actuator;

/* "ids": {
    "modelId": "TS0601",
    "manufacturerName": "_TZE200_ywdxldoj"
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
                "value": 3
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 1,
                "name": "appVersion",
                "value": 85
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 2,
                "name": "stackVersion",
                "value": 0
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 3,
                "name": "hwVersion",
                "value": 1
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 4,
                "name": "manufacturerName",
                "value": "_TZE200_ywdxldoj"
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 5,
                "name": "modelId",
                "value": "TS0601"
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 6,
                "name": "dateCode",
                "value": ""
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 7,
                "name": "powerSource",
                "value": "battery"
              },
              {
                "acl": [
                  "readable",
                  "writable",
                  "reportable"
                ],
                "id": 65502
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 2
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65534,
                "name": "attributeReportingStatus",
                "value": "PENDING"
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65504
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65505
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65506
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65507
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
                }
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 2
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
                "id": 0
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 1
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 2
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 3
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 4
              },
              {
                "acl": [
                  "readable",
                  "reportable"
                ],
                "id": 65533,
                "name": "clusterRevision",
                "value": 2
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

  // State
  // Attribute: "valve_detection"
  // Values: "ON", "OFF", "TOGGLE"
  // dp   0x0114  Valve state on / off
  //      data    0 or 1 (false/true)
  //
  // Valve Position
  // Attribute: "position"
  // Reported only, %
  // dp   0x026D  Valve position
  //      data    valve = (data & 0xFF) (on = valve > 3)
  //
  // Current Heating Point
  // Attribute: "current_heating_setpoint"
  // Values: *Number* between 5 and 35 (°C)
  // dp   0x0210  Thermostat heatsetpoint for moe
  //      data    temp = (data & 0xFFFF)*100
  //
  // Local Temperature
  // Attribute: "local_temperature"
  // Read only (°C)
  // dp   0x0218  Thermostat current temperature for moe
  //      data    temp = (data & 0xFFFF)*10
  //
  // System Mode
  // Attribute: "system_mode"
  // Values: "heat", "auto", "off"
  // dp   0x046a  mode
  //      data    0   "auto"
  //      data    1   "heat"
  //      data    2   "off"
  //
  // Preset
  // Attribute: "preset"
  // Values: "schedule", "manual", "boost", "comlex", "comfort", "eco"
  //
  // Running State
  // Attribute: "running_state"
  // Values: "idle", "heat"
  //
  // Auto Lock
  // Attribute: "auto_lock"
  // Values: "auto", "manual", "undefined"
  //
  // Away Mode
  // Attribute: "away_mode"
  // Values: "ON", "OFF", "undefined"
  // dp   0x016A  Away mode
  //      data    0 or 1 (false/true)
  //
  // Away Preset Days
  // Attribute: "away_preset_days"
  // Values: *Number*
  // Reported. Write only
  // 
  // Boost Time
  // Attribute: "boost_time"
  // Values: *Number* (s)
  // Multiples of 100
  //
  // Comfort Temperature
  // Attribute: "comfort_temperature"
  // Values: *Number* (°C)
  //
  // Eco Temperature
  // Attribute: "eco_temperature"
  // Values: *Number* (°C)
  //
  // Force Valve Position
  // Attribute: "force"
  // Values: "normal", "open", "close"
  //
  // Max Temperature
  // Attribute: "max_temperature"
  // Values: *Number* (°C)
  //
  // Minimum Temperature
  // Attribute: "min_temperature"
  // Values: *Number* (°C)
  //
  // Week
  // Attribute: "week"
  // Values: 5+2, 6+1, 7
  // Write only
  // 5+2 -> workdays schedule will be used monday-friday and saturday & sunday are holidays
  // 6+1 -> workdays schedule will be used monday-saturday and sunday is a holiday
  // 7 -> workdays schedule will be used for the whole week
  // 
  // Away Preset Temperature
  // Attribute: "away_preset_temperature"
  // Values: *Number* (°C)
  //
  // Link quality
  // Attribute: "linkquality"
  // Report only. Min 0, Max 255 (lqi)
  //
  // Battery (binary sensor)
  // Attribute: "battery_low"
  // Values: "true", "false"
  // dp   0x016E  Low battery
  //      data    0 or 1 (false/true)
  //