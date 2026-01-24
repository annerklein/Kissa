'use client';

interface RecipeCardProps {
  method: {
    name: string;
    displayName: string;
  };
  dose: number;
  water: number;
  waterTemp: number;
  steps?: unknown[];
  scaleFactor?: number;
}

export function RecipeCard({
  method,
  dose,
  water,
  waterTemp,
}: RecipeCardProps) {
  return (
    <div className="card mb-4">
      <h3 className="section-title mb-4">
        <span>📋</span>
        Recipe
      </h3>

      {/* Key params */}
      <div className={`grid ${method.name === 'moka' ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
        <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-coffee-800">{dose}g</p>
          <p className="text-xs text-coffee-500 mt-1">Coffee</p>
        </div>
        {method.name !== 'moka' && (
          <>
            <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{Math.round(water)}g</p>
              <p className="text-xs text-blue-500 mt-1">Water</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-700">{waterTemp}°</p>
              <p className="text-xs text-orange-500 mt-1">Temp</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
