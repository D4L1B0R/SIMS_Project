'use client';

import { useState } from 'react';
import { X, Clock, Users, ChefHat, Plus, Trash2, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeCreated: () => void;
}

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface PreparationStep {
  description: string;
  stepNumber?: number; // Dodato opciono polje za stepNumber
}

interface IngredientItem {
  quantity: string;
  measurementUnit: string;
  ingredientId?: string;
}

export default function CreateRecipeModal({ isOpen, onClose, onRecipeCreated }: CreateRecipeModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preparationSteps, setPreparationSteps] = useState<PreparationStep[]>([{ description: '' }]);
  const [ingredientItems, setIngredientItems] = useState<IngredientItem[]>([
    { quantity: '', measurementUnit: '', ingredientId: '' }
  ]);
  const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    preparation_time: '',
    heaviness: '',
    category: '',
    number_of_portions: ''
  });

  const heavinessOptions = [
    { value: 'LIGHT', label: 'Lako' },
    { value: 'MEDIUM', label: 'Srednje' },
    { value: 'HEAVY', label: 'Teško' }
  ];

  const categoryOptions = [
    { value: 'BREAKFAST', label: 'Doručak' },
    { value: 'LUNCH', label: 'Ručak' },
    { value: 'DINNER', label: 'Večera' },
    { value: 'SNACK', label: 'Užina' },
    { value: 'DESSERT', label: 'Desert' },
    { value: 'DRINK', label: 'Piće' }
  ];

  const equipmentOptions = [
    { id: 4, name: 'Mikser' },
    { id: 5, name: 'Blender' },
    { id: 6, name: 'Šerpa' },
    { id: 7, name: 'Pećnica' },
  ];

  const ingredientOptions = [
    { id: 7, name: 'Brasno' },
    { id: 8, name: 'Šećer' },
    { id: 9, name: 'Jaja' },
    { id: 10, name: 'Mleko' },
  ];

  const measurementUnits = ['g', 'kg', 'ml', 'l', 'komad', 'šolja', 'kašika', 'kašičica', 'prstohvat'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreparationStepChange = (index: number, value: string) => {
    const newSteps = [...preparationSteps];
    newSteps[index].description = value;
    setPreparationSteps(newSteps);
  };

  const addPreparationStep = () => {
    setPreparationSteps([...preparationSteps, { description: '' }]);
  };

  const removePreparationStep = (index: number) => {
    if (preparationSteps.length > 1) {
      const newSteps = preparationSteps.filter((_, i) => i !== index);
      setPreparationSteps(newSteps);
    }
  };

  const handleIngredientChange = (index: number, field: keyof IngredientItem, value: string) => {
    const newIngredients = [...ingredientItems];
    newIngredients[index][field] = value;
    setIngredientItems(newIngredients);
  };

  const addIngredient = () => {
    setIngredientItems([...ingredientItems, { quantity: '', measurementUnit: '', ingredientId: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredientItems.length > 1) {
      const newIngredients = ingredientItems.filter((_, i) => i !== index);
      setIngredientItems(newIngredients);
    }
  };

  const handleEquipmentChange = (id: number, checked: boolean) => {
    if (checked) {
      setEquipmentIds([...equipmentIds, id]);
    } else {
      setEquipmentIds(equipmentIds.filter(equipId => equipId !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = session?.user as ExtendedUser | undefined;
      const userId = user?.id;

      if (!userId) {
        throw new Error('Morate biti prijavljeni da biste kreirali recept');
      }

      const chefResponse = await fetch(`/api/chef-beginner?userId=${userId}`);
      const chefData = await chefResponse.json();

      if (!chefResponse.ok) {
        throw new Error(chefData.error || 'Došlo je do greške pri pronalaženju kuvara');
      }

      if (!chefData.chefBeginner) {
        throw new Error('Niste registrovani kao kuvar. Molimo vas da se prvo registrujete kao ChefBeginner.');
      }

      const chefBeginnerId = chefData.chefBeginner.id;

      if (preparationSteps.some(step => !step.description.trim())) {
        throw new Error('Svi koraci pripreme moraju imati opis');
      }

      if (ingredientItems.some(ing => !ing.quantity || !ing.measurementUnit)) {
        throw new Error('Svi sastojci moraju imati količinu i mernu jedinicu');
      }

      // Dodaj stepNumber za svaki korak
      const preparationStepsWithNumbers = preparationSteps
        .filter(step => step.description.trim())
        .map((step, index) => ({
          ...step,
          stepNumber: index + 1 // Dodaj stepNumber počevši od 1
        }));

      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          preparation_time: parseInt(formData.preparation_time),
          number_of_portions: parseInt(formData.number_of_portions),
          chefBeginnerId: chefBeginnerId, 
          preparationSteps: preparationStepsWithNumbers, // Koristi korake sa stepNumber
          equipmentIds: equipmentIds,
          ingredientItems: ingredientItems
            .filter(ing => ing.quantity && ing.measurementUnit)
            .map(ing => ({
              quantity: parseFloat(ing.quantity),
              measurementUnit: ing.measurementUnit,
              ingredientId: ing.ingredientId ? parseInt(ing.ingredientId) : undefined
            }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Došlo je do greške pri kreiranju recepta');
      }

      // Reset forme
      setFormData({
        title: '',
        preparation_time: '',
        heaviness: '',
        category: '',
        number_of_portions: ''
      });
      setPreparationSteps([{ description: '' }]);
      setIngredientItems([{ quantity: '', measurementUnit: '', ingredientId: '' }]);
      setEquipmentIds([]);
      
      onRecipeCreated();
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      preparation_time: '',
      heaviness: '',
      category: '',
      number_of_portions: ''
    });
    setPreparationSteps([{ description: '' }]);
    setIngredientItems([{ quantity: '', measurementUnit: '', ingredientId: '' }]);
    setEquipmentIds([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <ChefHat className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Kreiraj Novi Recept</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Osnovne informacije</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naslov recepta *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Naziv vašeg recepta"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Vreme (min) *
                </label>
                <Input
                  name="preparation_time"
                  type="number"
                  value={formData.preparation_time}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Porcije *
                </label>
                <Input
                  name="number_of_portions"
                  type="number"
                  value={formData.number_of_portions}
                  onChange={handleChange}
                  placeholder="4"
                  min="1"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Težina *
                </label>
                <Select
                  value={formData.heaviness}
                  onValueChange={(value) => handleSelectChange('heaviness', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberi težinu" />
                  </SelectTrigger>
                  <SelectContent>
                    {heavinessOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorija *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberi kategoriju" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sastojci *</h3>
            {ingredientItems.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Količina
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    placeholder="100"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jedinica
                  </label>
                  <Select
                    value={ingredient.measurementUnit}
                    onValueChange={(value) => handleIngredientChange(index, 'measurementUnit', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Jedinica" />
                    </SelectTrigger>
                    <SelectContent>
                      {measurementUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sastojak (opciono)
                  </label>
                  <Select
                    value={ingredient.ingredientId || ''}
                    onValueChange={(value) => handleIngredientChange(index, 'ingredientId', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberi sastojak" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredientOptions.map(ing => (
                        <SelectItem key={ing.id} value={ing.id.toString()}>
                          {ing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {ingredientItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addIngredient}
              disabled={loading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj sastojak
            </Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Potrebna oprema (opciono)</h3>
            <div className="grid grid-cols-2 gap-2">
              {equipmentOptions.map(equipment => (
                <label key={equipment.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={equipmentIds.includes(equipment.id)}
                    onChange={(e) => handleEquipmentChange(equipment.id, e.target.checked)}
                    disabled={loading}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{equipment.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Koraci pripreme *</h3>
            {preparationSteps.map((step, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Korak {index + 1}
                  </label>
                  <Textarea
                    value={step.description}
                    onChange={(e) => handlePreparationStepChange(index, e.target.value)}
                    placeholder={`Opis ${index + 1}. koraka...`}
                    required
                    disabled={loading}
                    rows={2}
                  />
                </div>
                {preparationSteps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePreparationStep(index)}
                    disabled={loading}
                    className="mt-7"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addPreparationStep}
              disabled={loading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj korak
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Otkaži
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Kreiranje...' : 'Kreiraj recept'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}