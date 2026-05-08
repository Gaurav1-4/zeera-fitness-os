import { FoodItem } from "../types";

export const foods: FoodItem[] = [
  // INDIAN FOODS
  { id: "f1", name: "Roti (Chapati)", calories: 120, protein: 3, carbs: 20, fats: 3, servingSize: "1", servingUnit: "piece", category: "indian", isVeg: true },
  { id: "f2", name: "Dal Tadka", calories: 150, protein: 9, carbs: 18, fats: 5, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f3", name: "Paneer Bhurji", calories: 250, protein: 18, carbs: 6, fats: 18, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f4", name: "Rajma Curry", calories: 180, protein: 12, carbs: 28, fats: 4, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f5", name: "Steamed Rice", calories: 200, protein: 4, carbs: 45, fats: 0.5, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f6", name: "Poha", calories: 180, protein: 4, carbs: 32, fats: 5, servingSize: "1", servingUnit: "plate", category: "indian", isVeg: true },
  { id: "f7", name: "Paratha (Plain)", calories: 200, protein: 4, carbs: 28, fats: 8, servingSize: "1", servingUnit: "piece", category: "indian", isVeg: true },
  { id: "f8", name: "Curd (Dahi)", calories: 60, protein: 4, carbs: 5, fats: 3, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f9", name: "Chole (Chickpea Curry)", calories: 200, protein: 10, carbs: 30, fats: 6, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f10", name: "Dosa (Plain)", calories: 170, protein: 4, carbs: 28, fats: 5, servingSize: "1", servingUnit: "piece", category: "indian", isVeg: true },
  { id: "f11", name: "Idli", calories: 80, protein: 2, carbs: 15, fats: 0.5, servingSize: "1", servingUnit: "piece", category: "indian", isVeg: true },
  { id: "f12", name: "Mixed Sabzi", calories: 120, protein: 3, carbs: 12, fats: 6, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f13", name: "Chicken Curry", calories: 280, protein: 28, carbs: 8, fats: 15, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: false },
  { id: "f14", name: "Egg Bhurji (2 eggs)", calories: 200, protein: 14, carbs: 3, fats: 15, servingSize: "2", servingUnit: "eggs", category: "indian", isVeg: false },
  { id: "f15", name: "Tandoori Chicken", calories: 220, protein: 30, carbs: 4, fats: 10, servingSize: "2", servingUnit: "pieces", category: "indian", isVeg: false },
  { id: "f16", name: "Paneer Tikka", calories: 280, protein: 20, carbs: 8, fats: 20, servingSize: "6", servingUnit: "pieces", category: "indian", isVeg: true },
  { id: "f17", name: "Aloo Gobi", calories: 160, protein: 4, carbs: 22, fats: 7, servingSize: "1", servingUnit: "bowl", category: "indian", isVeg: true },
  { id: "f18", name: "Lassi (Sweet)", calories: 180, protein: 6, carbs: 28, fats: 5, servingSize: "1", servingUnit: "glass", category: "indian", isVeg: true },
  // WESTERN FOODS
  { id: "f20", name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.5, servingSize: "100", servingUnit: "g", category: "western", isVeg: false },
  { id: "f21", name: "Brown Rice", calories: 215, protein: 5, carbs: 45, fats: 1.8, servingSize: "1", servingUnit: "cup", category: "western", isVeg: true },
  { id: "f22", name: "Greek Yogurt", calories: 130, protein: 15, carbs: 8, fats: 4, servingSize: "1", servingUnit: "cup", category: "western", isVeg: true },
  { id: "f23", name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fats: 2.5, servingSize: "1", servingUnit: "cup", category: "western", isVeg: true },
  { id: "f24", name: "Salmon Fillet", calories: 230, protein: 25, carbs: 0, fats: 14, servingSize: "100", servingUnit: "g", category: "western", isVeg: false },
  { id: "f25", name: "Sweet Potato", calories: 115, protein: 2, carbs: 27, fats: 0, servingSize: "1", servingUnit: "medium", category: "western", isVeg: true },
  { id: "f26", name: "Whole Eggs", calories: 155, protein: 13, carbs: 1, fats: 11, servingSize: "2", servingUnit: "eggs", category: "western", isVeg: false },
  { id: "f27", name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0.5, servingSize: "1", servingUnit: "medium", category: "western", isVeg: true },
  { id: "f28", name: "Peanut Butter", calories: 190, protein: 7, carbs: 7, fats: 16, servingSize: "2", servingUnit: "tbsp", category: "western", isVeg: true },
  // SUPPLEMENTS
  { id: "f30", name: "Whey Protein Shake", calories: 120, protein: 24, carbs: 3, fats: 1, servingSize: "1", servingUnit: "scoop", category: "supplement", isVeg: true },
  { id: "f31", name: "Mass Gainer Shake", calories: 450, protein: 30, carbs: 60, fats: 8, servingSize: "1", servingUnit: "serving", category: "supplement", isVeg: true },
  { id: "f32", name: "BCAA Drink", calories: 10, protein: 0, carbs: 2, fats: 0, servingSize: "1", servingUnit: "serving", category: "supplement", isVeg: true },
  // SNACKS
  { id: "f33", name: "Almonds", calories: 165, protein: 6, carbs: 6, fats: 14, servingSize: "28", servingUnit: "g", category: "snack", isVeg: true },
  { id: "f34", name: "Protein Bar", calories: 200, protein: 20, carbs: 22, fats: 7, servingSize: "1", servingUnit: "bar", category: "snack", isVeg: true },
  { id: "f35", name: "Apple", calories: 95, protein: 0.5, carbs: 25, fats: 0, servingSize: "1", servingUnit: "medium", category: "snack", isVeg: true },
  { id: "f36", name: "Makhana (Roasted)", calories: 90, protein: 3, carbs: 14, fats: 2, servingSize: "1", servingUnit: "cup", category: "snack", isVeg: true },
];
