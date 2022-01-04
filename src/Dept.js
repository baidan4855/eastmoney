import React, { useEffect, useState } from "react"
import { Spin, Table, Card } from "antd"
import axios from "axios"
import _ from "lodash"

import { RecentStocks } from "./RecentStocks"
import { Number } from "./widgets"
const getDeptsByPage = (pageNumber) =>
  axios.get("https://datacenter-web.eastmoney.com/api/data/v1/get", {
    headers: {
      referer: "https://data.eastmoney.com/",
      host: "huaxiang.eastmoney.com",
    },
    params: {
      sortColumns:
        "TOTAL_BUYER_SALESTIMES_1DAY,TOTAL_BUYER_SALESTIMES_2DAY,TOTAL_BUYER_SALESTIMES_3DAY,TOTAL_BUYER_SALESTIMES_5DAY,TOTAL_BUYER_SALESTIMES_10DAY",
      sortTypes: "-1,-1,-1,-1,-1",
      pageSize: 500,
      pageNumber,
      reportName: "RPT_RATEDEPT_RETURNT_RANKING",
      columns: "ALL",
      source: "WEB",
      client: "WEB",
      filter: '(STATISTICSCYCLE="01")', // 01代表近一个月上过榜， 02表示近三个月， 03近六个月，04近一年
    },
  })

const getAllDepts = async () => {
  let depts = []
  const data = await getDeptsByPage(1)
  const result = _.get(data, "data.result")
  if (result) {
    depts = _.concat(depts, result.data)
    if (result.pages > 1) {
      const restData = await Promise.all(
        _.map(new Array(result.pages - 1).fill(null), (v, index) => {
          return getDeptsByPage(index + 2)
        })
      )
      depts = _.concat(
        depts,
        ..._.map(restData, (d) => _.get(d, "data.result.data"))
      )
    }
  }
  depts = _.map(depts, (dept) => ({
    ...dept,
    SCORE_1DAY: _.ceil(
      dept.AVERAGE_INCREASE_1DAY *
        dept.RISE_PROBABILITY_1DAY *
        dept.TOTAL_BUYER_SALESTIMES_1DAY,
      1
    ),
    SCORE_2DAY: _.ceil(
      dept.AVERAGE_INCREASE_2DAY *
        dept.RISE_PROBABILITY_2DAY *
        dept.TOTAL_BUYER_SALESTIMES_2DAY,
      1
    ),
    SCORE_3DAY: _.ceil(
      dept.AVERAGE_INCREASE_3DAY *
        dept.RISE_PROBABILITY_3DAY *
        dept.TOTAL_BUYER_SALESTIMES_3DAY,
      1
    ),
    SCORE_5DAY: _.ceil(
      dept.AVERAGE_INCREASE_5DAY *
        dept.RISE_PROBABILITY_5DAY *
        dept.TOTAL_BUYER_SALESTIMES_5DAY,
      1
    ),
    SCORE_10DAY: _.ceil(
      dept.AVERAGE_INCREASE_10DAY *
        dept.RISE_PROBABILITY_10DAY *
        dept.TOTAL_BUYER_SALESTIMES_10DAY,
      1
    ),
  }))
  return _.unionBy(depts, "OPERATEDEPT_CODE")
}

export const Depts = () => {
  const [depts, setDepts] = useState([])
  useEffect(() => {
    const getDepts = async () => {
      setDepts(await getAllDepts())
    }
    getDepts()
  }, [])
  console.log(depts)
  return (
    <Table
      bordered
      rowKey="OPERATEDEPT_CODE"
      loading={_.isEmpty(depts)}
      dataSource={depts}
      size="small"
      expandable={{
        expandedRowRender: (record) => {
          return (
            <Card size="small" title="近期上榜股票">
              <RecentStocks deptCode={record.OPERATEDEPT_CODE} />
            </Card>
          )
        },
      }}
      columns={[
        {
          title: "名称",
          dataIndex: "OPERATEDEPT_NAME",
          render: (n, { OPERATEDEPT_CODE }) => (
            <a
              target="_blank"
              href={`https://data.eastmoney.com/stock/lhb/yyb/${OPERATEDEPT_CODE}.html`}
            >
              {n}
            </a>
          ),
        },
        {
          title: "上榜后1天",
          children: [
            {
              title: "买入次数",
              dataIndex: "TOTAL_BUYER_SALESTIMES_1DAY",
              sorter: (a, b) =>
                a.TOTAL_BUYER_SALESTIMES_1DAY - b.TOTAL_BUYER_SALESTIMES_1DAY,
            },
            {
              title: "平均涨幅",
              dataIndex: "AVERAGE_INCREASE_1DAY",
              sorter: (a, b) =>
                a.AVERAGE_INCREASE_1DAY - b.AVERAGE_INCREASE_1DAY,
              render: (v) => <Number value={_.ceil(v, 1)} suffix="%" />,
            },
            {
              title: "上涨概率",
              dataIndex: "RISE_PROBABILITY_1DAY",
              sorter: (a, b) =>
                a.RISE_PROBABILITY_1DAY - b.RISE_PROBABILITY_1DAY,
              render: (v) => (
                <Number value={_.ceil(v, 1)} gap={50} suffix="%" />
              ),
            },
            {
              title: "能力值",
              dataIndex: "SCORE_1DAY",
              defaultSortOrder: "descend",
              sorter: (a, b) => a.SCORE_1DAY - b.SCORE_1DAY,
            },
          ],
        },
        {
          title: "上榜后2天",
          children: [
            {
              title: "买入次数",
              dataIndex: "TOTAL_BUYER_SALESTIMES_2DAY",
              sorter: (a, b) =>
                a.TOTAL_BUYER_SALESTIMES_1DAY - b.TOTAL_BUYER_SALESTIMES_1DAY,
            },
            {
              title: "平均涨幅",
              dataIndex: "AVERAGE_INCREASE_2DAY",
              sorter: (a, b) =>
                a.AVERAGE_INCREASE_1DAY - b.AVERAGE_INCREASE_1DAY,
              render: (v) => <Number value={_.ceil(v, 1)} suffix="%" />,
            },
            {
              title: "上涨概率",
              dataIndex: "RISE_PROBABILITY_2DAY",
              sorter: (a, b) =>
                a.RISE_PROBABILITY_1DAY - b.RISE_PROBABILITY_1DAY,
              render: (v) => (
                <Number value={_.ceil(v, 1)} gap={50} suffix="%" />
              ),
            },
            {
              title: "能力值",
              dataIndex: "SCORE_2DAY",
              sorter: (a, b) => a.SCORE_1DAY - b.SCORE_1DAY,
            },
          ],
        },
        {
          title: "上榜后3天",
          children: [
            {
              title: "买入次数",
              dataIndex: "TOTAL_BUYER_SALESTIMES_3DAY",
              sorter: (a, b) =>
                a.TOTAL_BUYER_SALESTIMES_1DAY - b.TOTAL_BUYER_SALESTIMES_1DAY,
            },
            {
              title: "平均涨幅",
              dataIndex: "AVERAGE_INCREASE_3DAY",
              sorter: (a, b) =>
                a.AVERAGE_INCREASE_1DAY - b.AVERAGE_INCREASE_1DAY,
              render: (v) => <Number value={_.ceil(v, 1)} suffix="%" />,
            },
            {
              title: "上涨概率",
              dataIndex: "RISE_PROBABILITY_3DAY",
              sorter: (a, b) =>
                a.RISE_PROBABILITY_1DAY - b.RISE_PROBABILITY_1DAY,
              render: (v) => (
                <Number value={_.ceil(v, 1)} gap={50} suffix="%" />
              ),
            },
            {
              title: "能力值",
              dataIndex: "SCORE_3DAY",
              sorter: (a, b) => a.SCORE_1DAY - b.SCORE_1DAY,
            },
          ],
        },
        {
          title: "上榜后5天",
          children: [
            {
              title: "买入次数",
              dataIndex: "TOTAL_BUYER_SALESTIMES_5DAY",
              sorter: (a, b) =>
                a.TOTAL_BUYER_SALESTIMES_1DAY - b.TOTAL_BUYER_SALESTIMES_1DAY,
            },
            {
              title: "平均涨幅",
              dataIndex: "AVERAGE_INCREASE_5DAY",
              sorter: (a, b) =>
                a.AVERAGE_INCREASE_1DAY - b.AVERAGE_INCREASE_1DAY,
              render: (v) => <Number value={_.ceil(v, 1)} suffix="%" />,
            },
            {
              title: "上涨概率",
              dataIndex: "RISE_PROBABILITY_5DAY",
              sorter: (a, b) =>
                a.RISE_PROBABILITY_1DAY - b.RISE_PROBABILITY_1DAY,
              render: (v) => (
                <Number value={_.ceil(v, 1)} gap={50} suffix="%" />
              ),
            },
            {
              title: "能力值",
              dataIndex: "SCORE_5DAY",
              sorter: (a, b) => a.SCORE_1DAY - b.SCORE_1DAY,
            },
          ],
        },
        // {
        //   title: "上榜后10天",
        //   children: [
        //     {
        //       title: "买入次数",
        //       dataIndex: "TOTAL_BUYER_SALESTIMES_10DAY",
        //       sorter: (a, b) =>
        //         a.TOTAL_BUYER_SALESTIMES_1DAY - b.TOTAL_BUYER_SALESTIMES_1DAY,
        //     },
        //     {
        //       title: "平均涨幅",
        //       dataIndex: "AVERAGE_INCREASE_10DAY",
        //       sorter: (a, b) =>
        //         a.AVERAGE_INCREASE_1DAY - b.AVERAGE_INCREASE_1DAY,
        //       render: (v) => <Number value={_.ceil(v, 1)} suffix="%" />,
        //     },
        //     {
        //       title: "上涨概率",
        //       dataIndex: "RISE_PROBABILITY_10DAY",
        //       sorter: (a, b) =>
        //         a.RISE_PROBABILITY_1DAY - b.RISE_PROBABILITY_1DAY,
        //        render: (v) =>  <Number value={_.ceil(v, 1)} gap={50} suffix="%" />,
        //     },
        //     {
        //       title: "能力值",
        //       dataIndex: "SCORE_10DAY",
        //       sorter: (a, b) => a.SCORE_1DAY - b.SCORE_1DAY,
        //     },
        //   ],
        // },
      ]}
    />
  )
}
