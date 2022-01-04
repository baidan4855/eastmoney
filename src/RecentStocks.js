import React, { useEffect, useState } from "react"
import { Spin, Table, Card, Popover, Tabs } from "antd"
import { LineChartOutlined } from "@ant-design/icons"
import axios from "axios"
import _ from "lodash"

import { Number } from "./widgets"

const getRecentStocks = async (deptCode) => {
  const data = await axios.get(
    "https://datacenter-web.eastmoney.com/api/data/v1/get",
    {
      params: {
        sortColumns: "TRADE_DATE,NET_AMT",
        sortTypes: "-1,-1",
        pageSize: 200,
        pageNumber: 1,
        reportName: "RPT_OPERATEDEPT_TRADE_DETAILS",
        columns: "ALL",
        source: "WEB",
        client: "WEB",
        filter: '(OPERATEDEPT_CODE="' + deptCode + '")', // 01代表近一个月上过榜， 02表示近三个月， 03近六个月，04近一年
      },
    }
  )
  return _.get(data, "data.result.data")
}
export const RecentStocks = ({ deptCode }) => {
  const [stocks, setStocks] = useState([])
  useEffect(() => {
    const getStocks = async () => {
      if (!deptCode) return
      let data = await getRecentStocks(deptCode)``
      data = _.groupBy(data, (d) => d.TRADE_DATE.split(" ")[0])
      setStocks(data)
    }

    getStocks()
  }, [])
  return (
    <Tabs
      size="small"
      type="card"
      tabPosition="top"
      style={{ width: "calc(100vw - 60px)" }}
    >
      {_.map(stocks, (value, key) => {
        console.log(key)
        return (
          <Tabs.TabPane tab={key} key={key}>
            <Table
              bordered
              rowKey={(row) =>
                `${row.SECURITY_CODE}${row.TRADE_DATE}${row.EXPLANATION}`
              }
              dataSource={value}
              size="small"
              pagination={{ position: ["none", "bottomLeft"] }}
              //   expandable={{
              //     expandedRowRender: (record) => (
              //       <Card size="small" title="近期上榜股票">
              //         {"xxx"}
              //       </Card>
              //     ),
              //   }}
              columns={[
                {
                  title: "名称",
                  dataIndex: "SECURITY_NAME_ABBR",
                  render: (t, { SECURITY_CODE }) => (
                    <a
                      target="_blank"
                      href={`https://data.eastmoney.com/stockdata/${SECURITY_CODE}.html`}
                    >
                      {t}
                    </a>
                  ),
                },

                {
                  title: "代码",
                  dataIndex: "SECURITY_CODE",
                  render: (code) => {
                    const pre = _.startsWith(code, "6") ? 1 : 0
                    return (
                      <div>
                        <Popover
                          trigger="click"
                          placement="topLeft"
                          content={
                            <img
                              src={`https://webquoteklinepic.eastmoney.com/GetPic.aspx?nid=${pre}.${code}&UnitWidth=-6&imageType=KXL&EF=&Formula=RSI&AT=1`}
                            />
                          }
                        >
                          <span>{code}</span> <LineChartOutlined />
                        </Popover>
                      </div>
                    )
                  },
                },
                // {
                //   title: "日期",
                //   dataIndex: "TRADE_DATE",
                //   render: (v) => v.split(" ")[0],
                // },
                {
                  title: "买入额(万)",
                  dataIndex: "ACT_BUY",
                  render: (v) => (
                    <Number value={v ? _.ceil(v / 10000, 2) : 0} color="red" />
                  ),
                },
                {
                  title: "卖出额(万)",
                  dataIndex: "ACT_SELL",
                  render: (v) => (
                    <Number
                      value={v ? _.ceil(v / 10000, 2) : 0}
                      color="green"
                    />
                  ),
                },
                {
                  title: "净额(万)",
                  dataIndex: "NET_AMT",
                  render: (v) => (
                    <Number value={v ? _.ceil(v / 10000, 2) : 0} />
                  ),
                },
                {
                  title: "上榜原因",
                  dataIndex: "EXPLANATION",
                },
                {
                  title: "榜后1日",
                  dataIndex: "D1_CLOSE_ADJCHRATE",
                  render: (v) =>
                    v ? <Number value={_.ceil(v, 2)} suffix="%" /> : "-",
                },
                {
                  title: "榜后2日",
                  dataIndex: "D2_CLOSE_ADJCHRATE",
                  render: (v) =>
                    v ? <Number value={_.ceil(v, 2)} suffix="%" /> : "-",
                },
                {
                  title: "榜后3日",
                  dataIndex: "D3_CLOSE_ADJCHRATE",
                  render: (v) =>
                    v ? <Number value={_.ceil(v, 2)} suffix="%" /> : "-",
                },
                {
                  title: "榜后5日",
                  dataIndex: "D5_CLOSE_ADJCHRATE",
                  render: (v) =>
                    v ? <Number value={_.ceil(v, 2)} suffix="%" /> : "-",
                },
              ]}
            />
          </Tabs.TabPane>
        )
      })}
    </Tabs>
  )
}
