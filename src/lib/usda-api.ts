"use client";

import { FoodItem } from "@/lib/types";

export async function searchUSDA(query: string): Promise<FoodItem[]> {
  const API_KEY = "hA53H14PzMgct7KkzYz5lkaI5HgK9GIVe1qjqWxq"; // Using key directly for client-side search or could move to server action
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.foods) return [];

    return data.foods.map((f: any) => {
      const getNutrient = (id: number) => f.foodNutrients.find((n: any) => n.nutrientId === id || n.nutrientNumber === String(id))?.value || 0;
      
      return {
        id: `usda-${f.fdcId}`,
        name: f.description,
        calories: Math.round(getNutrient(1008) || getNutrient(208) || 0),
        protein: parseFloat((getNutrient(1003) || 0).toFixed(1)),
        carbs: parseFloat((getNutrient(1005) || 0).toFixed(1)),
        fats: parseFloat((getNutrient(1004) || 0).toFixed(1)),
        servingSize: "100",
        servingUnit: "g",
        category: "western",
        isVeg: true,
        brand: f.brandOwner
      };
    });
  } catch (error) {
    console.error("USDA Search Error:", error);
    return [];
  }
}
