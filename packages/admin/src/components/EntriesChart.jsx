import * as React from "react"
import { Card, CardHeader, CardContent } from "@mui/material"
import {
  ResponsiveContainer,
  // AreaChart,
  // Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { getISOWeek, parseISO } from "date-fns"

// const lastDay = new Date()
// const lastMonthDays = Array.from({ length: 30 }, (_, i) => subDays(lastDay, i))
// const aMonthAgo = subDays(new Date(), 30);

// const dateFormatter = (date) =>
//   new Date(date).toLocaleDateString();

const aggregateEntriesByWeek = (entries, attribute) =>
  entries.reduce((acc, curr) => {
    const week = getISOWeek(parseISO(curr[attribute]))
    if (!acc[week]) {
      acc[week] = 0
    }
    acc[week] += 1
    return acc
  }, {})

const getEntriesPerWeek = (entries) => {
  const createdAtPerWeek = aggregateEntriesByWeek(entries, "createdAt")
  const updatedAtPerWeek = aggregateEntriesByWeek(entries, "updatedAt")
  return Array(51)
    .fill()
    .map((element, index) => index + 1)
    .reduce((acc, curr) => {
      acc.push({
        date: curr,
        created: createdAtPerWeek[curr],
        updated: updatedAtPerWeek[curr],
      })
      return acc
    }, [])
}

const OrderChart = ({ entries, title }) => {
  if (!entries) return null

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={getEntriesPerWeek(entries)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" domain={[1, 52]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="created" fill="#8884d8" />
              <Bar dataKey="updated" fill="#82ca9d" />
            </BarChart>
            {/*<AreaChart data={getEntriesPerDay(entries)}>*/}
            {/*  <defs>*/}
            {/*    <linearGradient*/}
            {/*      id="colorUv"*/}
            {/*      x1="0"*/}
            {/*      y1="0"*/}
            {/*      x2="0"*/}
            {/*      y2="1"*/}
            {/*    >*/}
            {/*      <stop*/}
            {/*        offset="5%"*/}
            {/*        stopColor="#8884d8"*/}
            {/*        stopOpacity={0.8}*/}
            {/*      />*/}
            {/*      <stop*/}
            {/*        offset="95%"*/}
            {/*        stopColor="#8884d8"*/}
            {/*        stopOpacity={0}*/}
            {/*      />*/}
            {/*    </linearGradient>*/}
            {/*  </defs>*/}
            {/*  <XAxis*/}
            {/*    dataKey="date"*/}
            {/*    name="Date"*/}
            {/*    type="number"*/}
            {/*    scale="time"*/}
            {/*    domain={[*/}
            {/*      addDays(aMonthAgo, 1).getTime(),*/}
            {/*      new Date().getTime(),*/}
            {/*    ]}*/}
            {/*    tickFormatter={dateFormatter}*/}
            {/*  />*/}
            {/*  <YAxis dataKey="total" name="Entries"  />*/}
            {/*  <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>*/}
            {/*  <Tooltip*/}
            {/*    cursor={{ strokeDasharray: '3 3' }}*/}
            {/*    formatter={value =>*/}
            {/*      new Intl.NumberFormat(undefined, {*/}
            {/*      }).format(value)*/}
            {/*    }*/}
            {/*    labelFormatter={(label) =>*/}
            {/*      dateFormatter(label)*/}
            {/*    }*/}
            {/*  />*/}
            {/*  <Area*/}
            {/*    type="monotone"*/}
            {/*    dataKey="total"*/}
            {/*    stroke="#8884d8"*/}
            {/*    strokeWidth={2}*/}
            {/*    fill="url(#colorUv)"*/}
            {/*  />*/}
            {/*</AreaChart>*/}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderChart
