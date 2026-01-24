'use client';

interface BeanRankingItem {
  bean: {
    id: string;
    name: string;
    roaster: { name: string };
    process?: string;
  };
  brewCount: number;
  avgScore: number | null;
  bestScore: number;
}

interface BeanRankingListProps {
  beans: BeanRankingItem[];
  onBeanClick: (id: string) => void;
}

const rankBadges = ['🥇', '🥈', '🥉'];

export function BeanRankingList({ beans, onBeanClick }: BeanRankingListProps) {
  if (beans.length === 0) {
    return (
      <div className="text-coffee-500 text-sm p-4 text-center">
        No beans from this region
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {beans.map((item, index) => (
        <button
          key={item.bean.id}
          onClick={() => onBeanClick(item.bean.id)}
          className="card w-full flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          {/* Rank */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
            index < 3 
              ? 'bg-gradient-to-br from-amber-100 to-amber-200' 
              : 'bg-coffee-100 text-coffee-600'
          }`}>
            {index < 3 ? rankBadges[index] : index + 1}
          </div>

          {/* Bean info */}
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-coffee-800 truncate">{item.bean.name}</p>
            <p className="text-sm text-coffee-500 truncate">
              {item.bean.roaster.name}
              {item.bean.process && (
                <span className="ml-2 text-coffee-400">• {item.bean.process}</span>
              )}
            </p>
          </div>

          {/* Stats */}
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-coffee-800">
              {item.bestScore > 0 ? item.bestScore.toFixed(1) : '—'}
            </p>
            <p className="text-xs text-coffee-400">
              {item.brewCount} brew{item.brewCount !== 1 ? 's' : ''}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
