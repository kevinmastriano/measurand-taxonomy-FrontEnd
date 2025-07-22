'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { Taxon, Parameter, Discipline } from '@/types/taxonomy';
import { generateTaxonXML } from '@/lib/xml-parser';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AddMeasurandPage() {
  const [taxon, setTaxon] = useState<Partial<Taxon>>({
    name: '',
    definition: '',
    parameters: [],
    disciplines: [],
    result: {
      quantity: { name: '' },
      mLayer: { aspect: '', id: '' }
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [editingParameter, setEditingParameter] = useState<{index: number, parameter: Parameter} | null>(null);

  // Common quantity types and aspects for dropdowns
  const commonQuantities = [
    'acceleration', 'capacitance', 'conductance', 'conductivity', 'current', 
    'density', 'force', 'frequency', 'impedance', 'inductance', 'length', 
    'mass', 'phase', 'power', 'pressure', 'resistance', 'temperature', 
    'time', 'torque', 'voltage'
  ];

  const commonAspects = [
    'as_acceleration', 'as_capacitance', 'as_conductance', 'as_current', 
    'as_frequency', 'as_length', 'as_mass', 'as_power', 'as_pressure', 
    'as_resistance', 'as_temperature', 'as_time', 'as_voltage'
  ];

  const commonDisciplines = [
    'Dimensional', 'Electrical', 'Force', 'Frequency', 'Mass', 'Photometry',
    'Pressure', 'Temperature', 'Thermodynamics', 'Time', 'Vibration', 'Volume'
  ];

  const addParameter = () => {
    const newParameter: Parameter = {
      name: '',
      optional: false,
      definition: '',
      quantity: { name: '' },
      mLayer: { aspect: '', id: '' }
    };
    
    setTaxon(prev => ({
      ...prev,
      parameters: [...(prev.parameters || []), newParameter]
    }));
  };

  const updateParameter = (index: number, field: string, value: any) => {
    setTaxon(prev => {
      const newParameters = [...(prev.parameters || [])];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newParameters[index] = {
          ...newParameters[index],
          [parent]: {
            ...(newParameters[index] as any)[parent],
            [child]: value
          }
        };
      } else {
        newParameters[index] = {
          ...newParameters[index],
          [field]: value
        };
      }
      return { ...prev, parameters: newParameters };
    });
  };

  const removeParameter = (index: number) => {
    setTaxon(prev => ({
      ...prev,
      parameters: (prev.parameters || []).filter((_, i) => i !== index)
    }));
  };

  const addDiscipline = (disciplineName: string) => {
    if (disciplineName && !(taxon.disciplines || []).some(d => d.name === disciplineName)) {
      setTaxon(prev => ({
        ...prev,
        disciplines: [...(prev.disciplines || []), { name: disciplineName }]
      }));
    }
  };

  const removeDiscipline = (index: number) => {
    setTaxon(prev => ({
      ...prev,
      disciplines: (prev.disciplines || []).filter((_, i) => i !== index)
    }));
  };

  const editParameter = (index: number) => {
    const parameter = (taxon.parameters || [])[index];
    if (parameter) {
      setEditingParameter({ index, parameter: { ...parameter } });
    }
  };

  const saveEditedParameter = () => {
    if (editingParameter) {
      setTaxon(prev => ({
        ...prev,
        parameters: (prev.parameters || []).map((param, i) => 
          i === editingParameter.index ? editingParameter.parameter : param
        )
      }));
      setEditingParameter(null);
      toast.success('Parameter updated');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taxon.name || !taxon.definition) {
      toast.error('Name and definition are required');
      return;
    }

    try {
      setSubmitting(true);
      
      // Generate XML for the new taxon
      const xmlContent = generateTaxonXML(taxon as Taxon);
      
      // Create pending measurand object
      const pendingMeasurand = {
        id: crypto.randomUUID(),
        taxon: taxon as Taxon,
        submittedAt: new Date(),
        status: 'pending' as const,
        xmlContent
      };

      // Store in localStorage for demo purposes
      const existing = JSON.parse(localStorage.getItem('pendingMeasurands') || '[]');
      existing.push(pendingMeasurand);
      localStorage.setItem('pendingMeasurands', JSON.stringify(existing));

      toast.success('Measurand submitted for review!');
      
      // Reset form
      setTaxon({
        name: '',
        definition: '',
        parameters: [],
        disciplines: [],
        result: {
          quantity: { name: '' },
          mLayer: { aspect: '', id: '' }
        }
      });
      
    } catch (error) {
      console.error('Error submitting measurand:', error);
      toast.error('Failed to submit measurand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Taxonomy
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit New Measurand</CardTitle>
          <p className="text-sm text-muted-foreground">
            Submit a new measurand for review and approval by the taxonomy committee.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Taxon Name *</Label>
                  <Input
                    id="name"
                    value={taxon.name || ''}
                    onChange={(e) => setTaxon(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Measure.Temperature.Simulated.NewType"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    📋 Follow the naming convention: Process.QuantityKind.Qualifiers
                  </p>
                </div>

                <div>
                  <Label htmlFor="definition" className="text-sm font-medium text-gray-700">Definition *</Label>
                  <Textarea
                    id="definition"
                    value={taxon.definition || ''}
                    onChange={(e) => setTaxon(prev => ({ ...prev, definition: e.target.value }))}
                    placeholder="Provide a precise, technical definition of this measurand..."
                    required
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    📝 Be specific about what this measurand measures and how it differs from related measurands
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Disciplines */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <h3 className="text-xl font-semibold text-gray-900">Disciplines</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(taxon.disciplines || []).map((discipline, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {discipline.name}
                      <button
                        type="button"
                        onClick={() => removeDiscipline(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {(taxon.disciplines || []).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No disciplines added yet</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select onValueChange={addDiscipline}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Add a discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonDisciplines
                        .filter(d => !(taxon.disciplines || []).some(existing => existing.name === d))
                        .map(discipline => (
                          <SelectItem key={discipline} value={discipline}>
                            {discipline}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  🏷️ Select all relevant measurement disciplines for this measurand
                </p>
              </div>
            </div>

            {/* 3. Parameters */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <h3 className="text-xl font-semibold text-gray-900">Parameters</h3>
              </div>
              
              <div className="space-y-4">
                {(taxon.parameters || []).length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm text-muted-foreground">No parameters defined</p>
                    <p className="text-xs text-muted-foreground mt-1">Parameters specify additional inputs needed for this measurement</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(taxon.parameters || []).map((param, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-400">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{param.name}</h4>
                              <Badge variant={param.optional ? "outline" : "default"} size="sm">
                                {param.optional ? "Optional" : "Required"}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => editParameter(index)}
                                className="h-8 w-8 p-0"
                              >
                                ✏️
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeParameter(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          {param.definition && (
                            <p className="text-sm text-gray-600 mb-2">{param.definition}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Quantity:</span> {param.quantity?.name || 'Not specified'}
                            {param.mLayer?.aspect && (
                              <span className="ml-4"><span className="font-medium">M-Layer:</span> {param.mLayer.aspect}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addParameter}
                  className="w-full border-dashed border-2 py-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
                <p className="text-xs text-muted-foreground">
                  ⚙️ Define input parameters that are needed to specify this measurement
                </p>
              </div>
            </div>

            {/* 4. Results */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                <h3 className="text-xl font-semibold text-gray-900">Result Specification</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="resultQuantity" className="text-sm font-medium text-gray-700">Result Quantity *</Label>
                  <Select
                    value={taxon.result?.quantity?.name || ''}
                    onValueChange={(value) => setTaxon(prev => ({
                      ...prev,
                      result: {
                        ...prev.result,
                        quantity: { name: value }
                      }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select quantity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonQuantities.map(q => (
                        <SelectItem key={q} value={q}>
                          {q.charAt(0).toUpperCase() + q.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    📊 What type of quantity does this measurement produce?
                  </p>
                </div>

                <div>
                  <Label htmlFor="resultAspect" className="text-sm font-medium text-gray-700">M-Layer Aspect *</Label>
                  <Select
                    value={taxon.result?.mLayer?.aspect || ''}
                    onValueChange={(value) => setTaxon(prev => ({
                      ...prev,
                      result: {
                        ...prev.result,
                        mLayer: {
                          ...prev.result?.mLayer,
                          aspect: value,
                          id: value // Auto-generate ID from aspect
                        }
                      }
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select M-Layer aspect" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonAspects.map(aspect => (
                        <SelectItem key={aspect} value={aspect}>
                          {aspect.replace('as_', '').charAt(0).toUpperCase() + aspect.replace('as_', '').slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    🔗 How is this quantity represented in the measurement layer?
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Parameter Editing Dialog */}
      {editingParameter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Parameter</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Parameter Name</Label>
                <Input
                  value={editingParameter.parameter.name}
                  onChange={(e) => setEditingParameter(prev => prev ? {
                    ...prev,
                    parameter: { ...prev.parameter, name: e.target.value }
                  } : null)}
                  placeholder="Parameter name"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={editingParameter.parameter.optional}
                  onCheckedChange={(checked) => setEditingParameter(prev => prev ? {
                    ...prev,
                    parameter: { ...prev.parameter, optional: !!checked }
                  } : null)}
                />
                <Label>Optional parameter</Label>
              </div>

              <div>
                <Label>Definition</Label>
                <Textarea
                  value={editingParameter.parameter.definition || ''}
                  onChange={(e) => setEditingParameter(prev => prev ? {
                    ...prev,
                    parameter: { ...prev.parameter, definition: e.target.value }
                  } : null)}
                  placeholder="Parameter definition"
                  rows={2}
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <Select
                  value={editingParameter.parameter.quantity?.name || ''}
                  onValueChange={(value) => setEditingParameter(prev => prev ? {
                    ...prev,
                    parameter: {
                      ...prev.parameter,
                      quantity: { name: value }
                    }
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonQuantities.map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>M-Layer Aspect</Label>
                <Select
                  value={editingParameter.parameter.mLayer?.aspect || ''}
                  onValueChange={(value) => setEditingParameter(prev => prev ? {
                    ...prev,
                    parameter: {
                      ...prev.parameter,
                      mLayer: {
                        ...prev.parameter.mLayer,
                        aspect: value,
                        id: value
                      }
                    }
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aspect" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonAspects.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingParameter(null)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={saveEditedParameter}
              >
                Save Parameter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 