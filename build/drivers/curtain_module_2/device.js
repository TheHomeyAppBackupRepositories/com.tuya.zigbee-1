'use strict';

const { Cluster } = require('zigbee-clusters');
const TuyaSpecificCluster = require('../../lib/TuyaSpecificCluster');
const TuyaSpecificClusterDevice = require('../../lib/TuyaSpecificClusterDevice');

Cluster.addCluster(TuyaSpecificCluster);

const dataPoints = {
  position: 2,
  arrived: 3,
  motorReverse: 4,
}

const dataTypes = {
  raw: 0, // [ bytes ]
  bool: 1, // [0/1]
  value: 2, // [ 4 byte value ]
  string: 3, // [ N byte string ]
  enum: 4, // [ 0-255 ]
  bitmap: 5, // [ 1,2,4 bytes ] as bits
};

const convertMultiByteNumberPayloadToSingleDecimalNumber = (chunks) => {
  let value = 0;

  for (let i = 0; i < chunks.length; i++) {
    value = value << 8;
    value += chunks[i];
  }

  return value;
};

const getDataValue = (dpValue) => {
  switch (dpValue.datatype) {
    case dataTypes.raw:
      return dpValue.data;
    case dataTypes.bool:
      return dpValue.data[0] === 1;
    case dataTypes.value:
      return convertMultiByteNumberPayloadToSingleDecimalNumber(dpValue.data);
    case dataTypes.string:
      let dataString = '';
      for (let i = 0; i < dpValue.data.length; ++i) {
        dataString += String.fromCharCode(dpValue.data[i]);
      }
      return dataString;
    case dataTypes.enum:
      return dpValue.data[0];
    case dataTypes.bitmap:
      return convertMultiByteNumberPayloadToSingleDecimalNumber(dpValue.data);
  }
}

class curtain_module_2 extends TuyaSpecificClusterDevice {

  async onNodeInit({ zclNode }) {

    this.printNode();

    zclNode.endpoints[1].clusters.tuya.on("response", value => this.updatePosition(value));

    this.registerCapabilityListener('windowcoverings_set', value => this.setPosition(value));
    
  }

  async setPosition(pos) {
    const reverse = this.getSettings().reverse == 1;

    if (pos === undefined) {
      pos = this.getCapabilityValue('pos');
    } else {
      pos = reverse ? 1 - pos : pos;
    }

    return this.writeData32(dataPoints.position, pos * 100);
  }

  async updatePosition(data) {
    const dp = data.dp;
    const value = getDataValue(data);
    const reverse = this.getSettings().reverse == 1;

    switch (dp) {
      case dataPoints.arrived:
        const position = reverse ? (value & 0xFF) : 100 - (value & 0xFF);
        console.log(reverse, 100 - (value & 0xFF), (value & 0xFF))

        this.setCapabilityValue('windowcoverings_set', position / 100).catch(this.error);
        break;
    }
  }

  onDeleted() {
    this.log("Curtain Nodule removed")
  }

  async onSettings({oldSettings, newSettings, changedKeys}) {
    if (changedKeys.includes('reverse')) {
      this.setCapabilityValue('windowcoverings_set', 1 - this.getCapabilityValue('windowcoverings_set'));
    }
  }

}

module.exports = curtain_module_2;