import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const transferRate = new Trend('transfer_rate');
const connectionTimeTrend = new Trend('connection_time');

export const options = {
  stages: [
    { duration: '30m', target: 10000},
  ],
};

export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}

export default function() {
    let payload = {
      name: 'Distribuição pesquisa teste',
      channel: 'SMS Link',
      anonymous_answer: true,
      csv_file: 'string',
      template: 'string',
      research_id: 'e4ee82c7-2dee-4c20-9c99-76dc9b37b603'
    };
    
    let headers = {
      'Content-Type': 'application/json',
    };
    
    let res = http.post('http://44.201.207.222:8080/distribuitions/', JSON.stringify(payload), { headers: headers });

    errorRate.add(res.status >= 400);
    responseTimeTrend.add(res.timings.duration);
    transferRate.add(res.timings.duration, res.body.length);
    connectionTimeTrend.add(res.timings.connecting);
    
    check(res, {
        'status is 201': (r) => r.status === 201,
        'response time is less than 200ms': (r) => r.timings.duration < 200,
        'response body contains distributions name': (r) => r.body.indexOf('Distribuição pesquisa teste') !== -1,
        'response header contains application/json': (r) => r.headers['Content-Type'] === 'application/json; charset=utf-8',
    });    
  
    sleep(1);    
}