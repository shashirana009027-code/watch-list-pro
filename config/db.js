import mongoose from 'mongoose';
import dns from 'node:dns';
import { isIP } from 'node:net';

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

function resolveWithConfiguredDns(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const family = options?.family === 6 ? 6 : 4;
  const resolver = family === 6 ? dns.resolve6 : dns.resolve4;
  resolver(hostname, (error, addresses) => {
    if (error) return callback(error);
    const records = addresses.map(address => ({ address, family }));
    if (options?.all) return callback(null, records);
    return callback(null, records[0].address, family);
  });
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || '').split(',').map(server => server.trim()).filter(Boolean);
  if (dnsServers.length) {
    if (dnsServers.some(server => !isIP(server))) throw new Error('MONGODB_DNS_SERVERS must contain comma-separated DNS server IP addresses');
    dns.setServers(dnsServers);
  }
  if (!cached.promise) {
    const options = dnsServers.length ? { lookup: resolveWithConfiguredDns } : {};
    cached.promise = mongoose.connect(process.env.MONGODB_URI, options)
      .then(connection => connection)
      .catch(error => {
        cached.promise = null;
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
