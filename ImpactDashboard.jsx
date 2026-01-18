import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, CloudRain, ShieldCheck, Trophy, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ImpactDashboard = ({ userStats }) => {
  const data = [
    { name: 'Organic Purchases', value: 85, color: '#10b981' },
    { name: 'Conventional', value: 15, color: '#e2e8f0' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Achievement Card */}
      <div className="bg-gradient-to-br from-eco-900 to-emerald-800 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden col-span-1">
        <Trophy className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
        <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">Current Rank</h3>
        <p className="text-3xl font-black mb-6">Soil Guardian</p>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress to 'Eco Hero'</span>
            <span>88%</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: '88%' }} 
              className="h-full bg-emerald-400" 
            />
          </div>
        </div>
      </div>

      {/* Savings Stats */}
      <div className="md:col-span-2 grid grid-cols-2 gap-4">
        {[
          { label: 'Pesticides Avoided', value: '420g', icon: <ShieldCheck />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Water Conserved', value: '1,240L', icon: <Droplets />, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Carbon Offset', value: '12.5kg', icon: <CloudRain />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Producers Supported', value: '12', icon: <TrendingUp />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className={`${stat.bg} p-6 rounded-3xl border border-white flex flex-col justify-between`}
          >
            <div className={`${stat.color} p-2 bg-white w-fit rounded-xl shadow-sm`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};