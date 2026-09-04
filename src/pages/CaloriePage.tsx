import React, { useMemo, useState } from 'react';
import { useCalories } from '../contexts/CalorieContext';

interface Nutrient {
  nutrientId?: number;
  nutrientName?: string;
  name?: string;
  value?: number;
  amount?: number;
  unitName?: string;
  nutrient?: {
    id?: number;
    name?: string;
    unitName?: string;
  };
}

interface FoodPortion {
  amount?: number;
  modifier?: string;
  gramWeight?: number;
  portionDescription?: string;
}

interface FoodResult {
  fdcId: number;
  description: string;
  brandName?: string;
  dataType?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: Nutrient[];
  foodPortions?: FoodPortion[];
}

interface FoodDetails extends FoodResult {}

type QuantityMode = 'grams' | 'serving' | 'portion';
const getNutrient = (
  food: FoodResult,
  names: string[]
): number => {
  const nutrient = food.foodNutrients?.find((n: any) => {
    const name = (
      n.nutrientName ||
      n.name ||
      n.nutrient?.name ||
      ''
    ).toLowerCase();

    return names.some((target) =>
      name.includes(target)
    );
  });

  if (!nutrient) return 0;

  // USDA food details normally uses `amount`.
  if (typeof nutrient.amount === 'number') {
    return nutrient.amount;
  }

  // Some USDA responses use `value`.
  if (typeof nutrient.value === 'number') {
    return nutrient.value;
  }

  return 0;
};
const getBestFood = (
  foods: FoodResult[],
  query: string
): FoodResult | null => {
  if (!foods.length) return null;

  const normalizedQuery = query
    .toLowerCase()
    .trim();

  const words = normalizedQuery
    .split(/\s+/)
    .filter(Boolean);

  const scored = foods.map((food) => {
    const description = String(
      food.description || ''
    ).toLowerCase();

    const isBranded =
      Boolean(food.brandName) ||
      food.dataType?.toLowerCase() === 'branded';

    let score = 0;

    // Strongly prefer normal/generic foods.
    if (!isBranded) {
      score += 100;
    } else {
      score -= 100;
    }

    // Exact match.
    if (description === normalizedQuery) {
      score += 150;
    }

    // Starts with the user's search.
    if (description.startsWith(normalizedQuery)) {
      score += 80;
    }

    // Contains the complete phrase.
    if (description.includes(normalizedQuery)) {
      score += 50;
    }

    // Match individual words.
    for (const word of words) {
      if (description.includes(word)) {
        score += 20;
      }
    }

    // Avoid very long, complicated descriptions.
    if (description.length < 50) {
      score += 15;
    } else if (description.length > 150) {
      score -= 10;
    }

    return {
      food,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.food ?? null;
};

const CaloriePage: React.FC = () => {
  const {
    entries,
    loading,
    addEntry,
    deleteEntry,
  } = useCalories();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [selectedFood, setSelectedFood] =
    useState<FoodDetails | null>(null);

  const [quantity, setQuantity] = useState(100);
  const [quantityMode, setQuantityMode] =
    useState<QuantityMode>('grams');

  const [selectedPortion, setSelectedPortion] =
    useState<FoodPortion | null>(null);

  const [mealType, setMealType] =
    useState('Breakfast');

  const [error, setError] = useState('');

  // Manual entry
  const [manualMode, setManualMode] =
    useState(false);

  const [manualFoodName, setManualFoodName] =
    useState('');

  const [manualQuantity, setManualQuantity] =
    useState(1);

  const [manualUnit, setManualUnit] =
    useState('serving');

  const [manualCalories, setManualCalories] =
    useState('');

  const [manualProtein, setManualProtein] =
    useState('');

  const [manualCarbs, setManualCarbs] =
    useState('');

  const [manualFat, setManualFat] =
    useState('');

  const todayEntries = useMemo(() => {
    const today = new Date().toDateString();

    return entries.filter(
      (entry) =>
        new Date(entry.consumed_at).toDateString() ===
        today
    );
  }, [entries]);

  const totals = useMemo(() => {
    return todayEntries.reduce(
      (total, entry) => ({
        calories:
          total.calories +
          Number(entry.calories || 0),

        protein:
          total.protein +
          Number(entry.protein_g || 0),

        carbs:
          total.carbs +
          Number(entry.carbs_g || 0),

        fat:
          total.fat +
          Number(entry.fat_g || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    );
  }, [todayEntries]);

  const availablePortions =
    selectedFood?.foodPortions?.filter(
      (portion) =>
        typeof portion.gramWeight === 'number' &&
        portion.gramWeight > 0
    ) ?? [];

  const getBaseWeight = (): number => {
    if (!selectedFood) return 100;

    if (
      quantityMode === 'serving' &&
      selectedFood.servingSize
    ) {
      const unit =
        selectedFood.servingSizeUnit?.toLowerCase() || '';

      if (unit.includes('g')) {
        return selectedFood.servingSize;
      }

      // USDA sometimes gives a serving size
      // without a gram unit. In that case use it
      // as a single serving and fall back to 100g
      // for nutrition scaling.
      return 100;
    }

    if (
      quantityMode === 'portion' &&
      selectedPortion?.gramWeight
    ) {
      return selectedPortion.gramWeight;
    }

    return 100;
  };

  const getQuantityLabel = () => {
    if (quantityMode === 'serving') {
      return 'Quantity (servings)';
    }

    if (quantityMode === 'portion') {
      return 'Quantity';
    }

    return 'Quantity (grams)';
  };

  const calculateNutrition = (
    food: FoodResult
  ) => {
    const baseWeight = getBaseWeight();

    const grams =
      quantityMode === 'grams'
        ? Number(quantity || 0)
        : Number(quantity || 0) * baseWeight;

    const multiplier = grams / 100;

    return {
      calories:
        getNutrient(food, ['energy']) *
        multiplier,

      protein:
        getNutrient(food, ['protein']) *
        multiplier,

      carbs:
        getNutrient(food, ['carbohydrate']) *
        multiplier,

      fat:
        getNutrient(
          food,
          ['total lipid', 'total fat']
        ) * multiplier,
    };
  };

  const searchFoods = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setError('');
    setSelectedFood(null);

    try {
      const response = await fetch(
        `/api/usda/search?q=${encodeURIComponent(
          query.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Food search failed'
        );
      }

      const foods: FoodResult[] =
        data.foods || [];

      if (!foods.length) {
        setError(
          'Food not found. You can enter the calories manually.'
        );
        return;
      }

      // Automatically choose the best match.
      const bestFood = getBestFood(
        foods,
        query.trim()
      );

      if (!bestFood) {
        setError(
          'Food not found. You can enter the calories manually.'
        );
        return;
      }

      // Fetch complete food details.
      const detailsResponse = await fetch(
        `/api/usda/food?fdcId=${bestFood.fdcId}`
      );

      const details =
        await detailsResponse.json();

      if (!detailsResponse.ok) {
        throw new Error(
          details.error ||
            'Could not load food details'
        );
      }

      setSelectedFood(details);

      if (
        details.servingSize &&
        details.servingSizeUnit
      ) {
        const unit =
          details.servingSizeUnit.toLowerCase();

        if (unit.includes('g')) {
          setQuantity(
            Number(details.servingSize)
          );
          setQuantityMode('grams');
        } else {
          setQuantity(1);
          setQuantityMode('serving');
        }
      } else {
        setQuantity(100);
        setQuantityMode('grams');
      }

      setSelectedPortion(
        details.foodPortions?.find(
          (portion: FoodPortion) =>
            typeof portion.gramWeight ===
              'number' &&
            portion.gramWeight > 0
        ) ?? null
      );
    } catch (err) {
      console.error(err);

      setError(
        'Could not search for food. Please try again.'
      );
    } finally {
      setSearching(false);
    }
  };

  const handleAddFood = async () => {
    if (!selectedFood || quantity <= 0) {
      return;
    }

    const nutrition =
      calculateNutrition(selectedFood);

    const unit =
      quantityMode === 'grams'
        ? 'g'
        : quantityMode === 'serving'
          ? 'serving'
          : 'portion';

    const result = await addEntry({
      food_name: selectedFood.description,
      fdc_id: selectedFood.fdcId,
      quantity,
      serving_unit: unit,
      calories:
        Math.round(
          nutrition.calories * 10
        ) / 10,

      protein_g:
        Math.round(
          nutrition.protein * 10
        ) / 10,

      carbs_g:
        Math.round(
          nutrition.carbs * 10
        ) / 10,

      fat_g:
        Math.round(
          nutrition.fat * 10
        ) / 10,

      meal_type: mealType,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setSelectedFood(null);
    setQuery('');
    setQuantity(100);
    setQuantityMode('grams');
    setSelectedPortion(null);
  };

  const handleManualAdd = async () => {
    const calories =
      Number(manualCalories);

    if (
      !manualFoodName.trim() ||
      manualQuantity <= 0 ||
      calories < 0
    ) {
      setError(
        'Enter a food name, quantity and calories.'
      );
      return;
    }

    const result = await addEntry({
      food_name: manualFoodName.trim(),
      quantity: manualQuantity,
      serving_unit: manualUnit,
      calories,

      protein_g:
        Number(manualProtein || 0),

      carbs_g:
        Number(manualCarbs || 0),

      fat_g:
        Number(manualFat || 0),

      meal_type: mealType,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setManualFoodName('');
    setManualQuantity(1);
    setManualUnit('serving');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualMode(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Calorie Tracker
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Add food and track your daily nutrition.
        </p>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Calories"
          value={Math.round(totals.calories)}
          unit="kcal"
        />

        <SummaryCard
          label="Protein"
          value={Math.round(totals.protein)}
          unit="g"
        />

        <SummaryCard
          label="Carbs"
          value={Math.round(totals.carbs)}
          unit="g"
        />

        <SummaryCard
          label="Fat"
          value={Math.round(totals.fat)}
          unit="g"
        />
      </div>

      {/* Add food */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-bold mb-4">
          Add Food
        </h2>

        {!manualMode && !selectedFood && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchFoods();
                  }
                }}
                placeholder="What did you eat? e.g. rice, roti, chicken curry"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
              />

              <button
                onClick={searchFoods}
                disabled={
                  searching || !query.trim()
                }
                className="px-6 py-3 rounded-xl bg-brand-500 text-white font-bold disabled:opacity-50"
              >
                {searching
                  ? 'Finding...'
                  : 'Add Food'}
              </button>
            </div>

            <button
              onClick={() => {
                setManualMode(true);
                setError('');
              }}
              className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Enter calories manually
            </button>
          </>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-3">
            {error}
          </p>
        )}

        {/* Selected food */}
        {selectedFood && !manualMode && (
          <div className="mt-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">
                  {selectedFood.description}
                </p>

                {selectedFood.brandName && (
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedFood.brandName}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedFood(null);
                  setQuery('');
                }}
                className="text-xs text-slate-500 hover:text-red-500"
              >
                Change
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  {getQuantityLabel()}
                </label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Quantity Type
                </label>

                <select
                  value={quantityMode}
                  onChange={(e) => {
                    const mode =
                      e.target.value as QuantityMode;

                    setQuantityMode(mode);

                    if (mode === 'grams') {
                      setQuantity(100);
                    } else {
                      setQuantity(1);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="grams">
                    Grams
                  </option>

                  {selectedFood.servingSize && (
                    <option value="serving">
                      USDA serving
                    </option>
                  )}

                  {availablePortions.length > 0 && (
                    <option value="portion">
                      USDA portion
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Meal
                </label>

                <select
                  value={mealType}
                  onChange={(e) =>
                    setMealType(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>
            </div>

            {quantityMode === 'portion' &&
              availablePortions.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Portion
                  </label>

                  <select
                    value={
                      selectedPortion
                        ? availablePortions.indexOf(
                            selectedPortion
                          )
                        : 0
                    }
                    onChange={(e) => {
                      setSelectedPortion(
                        availablePortions[
                          Number(e.target.value)
                        ]
                      );
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {availablePortions.map(
                      (portion, index) => (
                        <option
                          key={index}
                          value={index}
                        >
                          {portion.portionDescription ||
                            portion.modifier ||
                            `${portion.gramWeight} g`}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

            {/* Nutrition preview */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              {(() => {
                const nutrition =
                  calculateNutrition(
                    selectedFood
                  );

                return (
                  <>
                    <NutritionItem
                      label="Calories"
                      value={
                        nutrition.calories
                      }
                      unit="kcal"
                    />

                    <NutritionItem
                      label="Protein"
                      value={
                        nutrition.protein
                      }
                      unit="g"
                    />

                    <NutritionItem
                      label="Carbs"
                      value={
                        nutrition.carbs
                      }
                      unit="g"
                    />

                    <NutritionItem
                      label="Fat"
                      value={nutrition.fat}
                      unit="g"
                    />
                  </>
                );
              })()}
            </div>

            <button
              onClick={handleAddFood}
              className="w-full mt-5 py-3 rounded-xl bg-brand-500 text-white font-bold hover:opacity-90"
            >
              Add to Today's Log
            </button>

            <button
              onClick={() => {
                setSelectedFood(null);
                setQuery('');
              }}
              className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Search another food
            </button>
          </div>
        )}

        {/* Manual entry */}
        {manualMode && (
          <div className="mt-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold">
                  Enter Food Manually
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Useful for homemade meals or foods
                  not found in the database.
                </p>
              </div>

              <button
                onClick={() => {
                  setManualMode(false);
                  setError('');
                }}
                className="text-xs text-slate-500 hover:text-red-500"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Food name
                </label>

                <input
                  value={manualFoodName}
                  onChange={(e) =>
                    setManualFoodName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Homemade chicken curry"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={manualQuantity}
                  onChange={(e) =>
                    setManualQuantity(
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Unit
                </label>

                <select
                  value={manualUnit}
                  onChange={(e) =>
                    setManualUnit(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="serving">
                    serving
                  </option>
                  <option value="bowl">
                    bowl
                  </option>
                  <option value="plate">
                    plate
                  </option>
                  <option value="piece">
                    piece
                  </option>
                  <option value="g">
                    grams
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Calories (kcal) *
                </label>

                <input
                  type="number"
                  min="0"
                  value={manualCalories}
                  onChange={(e) =>
                    setManualCalories(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 350"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Protein (g)
                </label>

                <input
                  type="number"
                  min="0"
                  value={manualProtein}
                  onChange={(e) =>
                    setManualProtein(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Carbs (g)
                </label>

                <input
                  type="number"
                  min="0"
                  value={manualCarbs}
                  onChange={(e) =>
                    setManualCarbs(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Fat (g)
                </label>

                <input
                  type="number"
                  min="0"
                  value={manualFat}
                  onChange={(e) =>
                    setManualFat(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">
                  Meal
                </label>

                <select
                  value={mealType}
                  onChange={(e) =>
                    setMealType(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleManualAdd}
              className="w-full mt-5 py-3 rounded-xl bg-brand-500 text-white font-bold hover:opacity-90"
            >
              Add to Today's Log
            </button>
          </div>
        )}
      </div>

      {/* Today's log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-bold mb-4">
          Today's Food
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500">
            Loading...
          </p>
        ) : todayEntries.length === 0 ? (
          <p className="text-sm text-slate-500">
            No food logged today.
          </p>
        ) : (
          <div className="space-y-3">
            {todayEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {entry.food_name}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {entry.quantity}
                    {entry.serving_unit}
                    {entry.meal_type
                      ? ` • ${entry.meal_type}`
                      : ''}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold">
                    {Math.round(
                      entry.calories
                    )}{' '}
                    kcal
                  </p>

                  <p className="text-xs text-slate-500">
                    P{' '}
                    {Math.round(
                      entry.protein_g
                    )}
                    g
                  </p>
                </div>

                <button
                  onClick={() =>
                    deleteEntry(entry.id)
                  }
                  className="text-xs text-slate-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
    <p className="text-xs text-slate-500 font-semibold">
      {label}
    </p>

    <p className="text-2xl font-bold mt-1">
      {value}

      <span className="text-xs font-medium text-slate-400 ml-1">
        {unit}
      </span>
    </p>
  </div>
);

const NutritionItem = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) => (
  <div className="text-center p-3 rounded-xl bg-white dark:bg-slate-900">
    <p className="text-[10px] uppercase font-bold text-slate-400">
      {label}
    </p>

    <p className="font-bold mt-1">
      {Math.round(value * 10) / 10}

      <span className="text-[10px] text-slate-400 ml-1">
        {unit}
      </span>
    </p>
  </div>
);

export default CaloriePage;