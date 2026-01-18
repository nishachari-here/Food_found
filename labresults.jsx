import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertCircle, Download, ExternalLink, Beaker } from 'lucide-react';

const LabResults = ({ batchId }) => {
  const [activeReport, setActiveReport] = useState(null);

  const reports = [
    { id: 'R-101', type: 'Pesticide Analysis', date: 'Jan 10, 2026', status: 'Passed', results: '0.00% detected' },
    { id: 'R-102', type: 'Heavy Metals', date: 'Jan 10, 2026', status: 'Passed', results: 'Below LOQ' },
    { id: 'R-103', type: 'Nutrient Density', date: 'Jan 11, 2026', status: 'Optimal', results: 'Vit C: 120%' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 border border-emerald-100 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Beaker className="text-emerald-500" /> Laboratory Reports
        </h3>
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">
          3 Certificates Verified
        </span>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <motion.div 
            key={report.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{report.type}</h4>
                  <p className="text-xs text-slate-400">ID: {report.id} • {report.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <CheckCircle2 size={14} /> {report.status}
                  </span>
                  <p className="text-[10px] text-slate-500">{report.results}</p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <Download size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
        <ExternalLink size={16} /> View Full Blockchain Certificate
      </button>
    </div>
  );
};