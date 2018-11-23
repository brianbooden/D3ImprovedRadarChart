// Distributed using MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.//
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import paint from './paint';

export default {
  initialProperties: {
    qHyperCubeDef: {
      qDimensions: [],
      qMeasures: [],
      qInitialDataFetch: [{
        qWidth: 3,
        qHeight: 3333
      }]
    }
  },
  support: {
    snapshot: true,
    export: true,
    exportData: true
  },
  definition: {
    type: "items",
    component: "accordion",
    items: {
      dimensions: {
        uses: "dimensions",
        min: 2,
        max: 2
      },
      measures: {
        uses: "measures",
        min: 1,
        max: 1
      },
      sorting: {
        uses: "sorting"
      },
      settings : {
        uses : "settings",
        items : {
          Line:{
            ref: "strokeStyle",
            component: "dropdown",
            type: "boolean",
            label: "Stroke type",
            defaultValue:  true,
            options: [{
              value: true,
              label: "Smooth"
            }, {
              value: false,
              label: "Straight"
            }],
            show: true
          },
          Legend:{
            ref: "showLegend",
            component: "switch",
            type: "boolean",
            translation: "Legend",
            defaultValue: true,
            trueOption: {
              value: true,
              translation: "properties.on"
            },
            falseOption: {
              value: false,
              translation: "properties.off"
            },
            show: true
          },
          colors: {

            type: "items",
            label: "Colors",
            items : {
              ColorSchema: {
                ref: "ColorSchema",
                type: "string",
                component: "dropdown",
                label: "Color",
                show: true,
                options: [
                  {
                    value: "#fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506",
                    label: "Sequential"
                  }, {
                    value: "#662506, #993404, #cc4c02, #ec7014, #fe9929, #fec44f, #fee391",
                    label: "Sequential (Reverse)"
                  }, {
                    value: "#d73027, #f46d43, #fee090, #abd9e9, #74add1, #4575b4",
                    label: "Diverging RdYlBu"
                  }, {
                    value: "#4575b4, #74add1, #abd9e9, #fee090, #f46d43, #d73027",
                    label: "Diverging BuYlRd (Reverse)"
                  }, {
                    value: "#deebf7, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #08519c, #08306b",
                    label: "Blues"
                  }, {
                    value: "#fee0d2, #fcbba1, #fc9272, #fb6a4a, #ef3b2c, #cb181d, #a50f15, #67000d",
                    label: "Reds"
                  }, {
                    value: "#edf8b1, #c7e9b4, #7fcdbb, #41b6c4, #1d91c0, #225ea8, #253494, #081d58",
                    label: "YlGnBu"
                  }, {
                    value: "#332288, #6699CC, #88CCEE, #44AA99, #117733, #999933, #DDCC77, #661100, #CC6677, #AA4466, #882255, #AA4499",
                    label: "12 colors"
                  }, {
                    value: "#AA4499, #882255, #AA4466, #CC6677, #661100, #DDCC77, #999933, #117733, #44AA99, #88CCEE, #6699CC, #332288",
                    label: "12 colors (Reverse)"
                  }, {
                    value: "#1ABC9C, #7F8C8D, #2ECC71, #BDC3C7, #3498DB, #C0392B, #9B59B6, #D35400, #34495E, #F39C12, #16A085, #95A5A6",
                    label: "Blue purple colors"
                  }, {
                    value: "#BE4FC0, #4477AA",
                    label: "2 colors"
                  }, {
                    value: "#4477AA, #BE4FC0",
                    label: "2 colors (Reverse)"
                  }
                ],
                defaultValue: "#332288, #6699CC, #88CCEE, #44AA99, #117733, #999933, #DDCC77, #661100, #CC6677, #AA4466, #882255, #AA4499"
              }
            }
          }
        }
      }
    }
  },
  snapshot: {
    canTakeSnapshot: true
  },
  paint: paint //($element, layout) => {
  //   const component = this;
  //   try {
  //     paint($element, layout, component);
  //   } catch (exception) {
  //     console.error(exception); // eslint-disable-line no-console
  //   }
  // }
};
