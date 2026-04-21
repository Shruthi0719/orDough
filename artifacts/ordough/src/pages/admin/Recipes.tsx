import { useListRecipes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function Recipes() {
  const { data: recipes, isLoading } = useListRecipes();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#3A2119]">Recipes</h1>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recipes?.map(recipe => (
            <Card key={recipe.id}>
              <CardHeader className="pb-3 border-b border-[#EBCDB7]/30">
                <CardTitle className="text-[#3A2119] flex items-center gap-2 text-lg">
                  <BookOpen size={18} className="text-[#79A3C3]" />
                  {recipe.menuItemName}
                </CardTitle>
                <div className="text-xs text-[#3A2119]/60">Makes {recipe.servings} servings</div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-[#3A2119]/50 mb-2">Ingredients</h4>
                    <ul className="space-y-1 text-sm text-[#3A2119]">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex justify-between border-b border-[#EBCDB7]/20 pb-1 last:border-0">
                          <span>{ing.ingredientName}</span>
                          <span className="font-medium">{ing.quantity} {ing.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {recipe.instructions && (
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-[#3A2119]/50 mb-2">Instructions</h4>
                      <p className="text-sm text-[#3A2119]/80 whitespace-pre-wrap">{recipe.instructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
