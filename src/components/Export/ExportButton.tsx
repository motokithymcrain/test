import { Download } from 'lucide-react';
import { useState } from 'react';
import { exportToCSV, exportToJSON } from '../../utils/exportData';

interface ExportButtonProps {
  data: any[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleExportCSV = () => {
    exportToCSV(data, filename);
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    exportToJSON(data, filename);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        disabled={data.length === 0}
      >
        <Download className="w-4 h-4 mr-2" />
        エクスポート
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <button
            onClick={handleExportCSV}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            CSV形式
          </button>
          <button
            onClick={handleExportJSON}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            JSON形式
          </button>
        </div>
      )}
    </div>
  );
}
