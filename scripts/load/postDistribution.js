import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const transferRate = new Trend('transfer_rate');
const connectionTimeTrend = new Trend('connection_time');

export const options = {
  stages: [
    { duration: '30m', target: 10000},
  ],
};

export default function() {
    let payload = {
      name: 'Distribuição pesquisa teste',
      channel: 'SMS Link',
      anonymous_answer: true,
      csv_file: 'string',
      template: 'string',
      research_id: '3379156f-39c0-4af0-97b0-67671b82ee7a'
    };
    
    let headers = {
      'Content-Type': 'application/json',
    };
    
    let res = http.post('http://54.174.44.249:8080/distribuitions/', JSON.stringify(payload), { headers: headers });

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