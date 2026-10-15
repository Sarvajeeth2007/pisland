import React, { useState } from 'react';
import { useSystemStore } from '../store/systemStore';
import { Clipboard, Copy, Check, Trash2, Plus } from 'lucide-react';

export const ClipboardWidget: React.FC = () => {
  const { clipboardHistory, addToClipboard, clearClipboard, triggerNotification } = useSystemStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    
    triggerNotification({
      type: 'bluetooth',
      title: 'Copied to Clipboard',
      subtitle: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
      duration: 2000
    });

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addToClipboard(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="flex flex-col gap-3 p-1 select-none max-h-[300px] font-sans">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-[10px] tracking-wider uppercase text-neutral-500">Clipboard History</h3>
        {clipboardHistory.length > 0 && (
          <button 
            onClick={clearClipboard}
            className="text-[9px] flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 size={10} /> Clear
          </button>
        )}
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleAdd} className="flex gap-2 w-full min-w-0">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add manual clipboard item..."
          className="flex-1 min-w-0 w-full px-3 py-1.5 rounded-xl bg-black/[0.30] border border-white/[0.06] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent transition-colors"
        />
        <button 
          type="submit"
          className="px-2.5 py-1.5 rounded-xl bg-accent text-white hover:bg-accent/80 transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <Plus size={14} />
        </button>
      </form>

      {/* History Items list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1 max-h-[160px]">
        {clipboardHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-neutral-500 gap-1 text-xs">
            <Clipboard size={18} className="opacity-50" />
            <span>Clipboard is empty</span>
          </div>
        ) : (
          clipboardHistory.map((item) => (
            <div 
              key={item.id}
              onClick={() => handleCopy(item.text, item.id)}
              className="group flex justify-between items-center p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] hover:border-white/[0.08] cursor-pointer transition-all duration-200"
            >
              <div className="flex-1 truncate mr-2 text-xs font-mono text-neutral-300">
                {item.text}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[9px] text-neutral-500 font-mono">{item.timestamp}</span>
                <button className="text-neutral-400 group-hover:text-white transition-colors cursor-pointer">
                  {copiedId === item.id ? (
                    <Check size={11} className="text-emerald-400" />
                  ) : (
                    <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
