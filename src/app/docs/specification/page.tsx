'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Book, Code, Info, Layers } from 'lucide-react';
import Link from 'next/link';
import { loadDocumentContent } from '@/lib/taxonomy-data';

export default function SpecificationPage() {
  const [specContent, setSpecContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const spec = await loadDocumentContent('MII_Taxonomy_Specification.md');
        setSpecContent(spec);
      } catch (error) {
        console.error('Error loading specification:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  // Parse the markdown content into sections
  const parseMarkdownSections = (content: string) => {
    const sections: { title: string; content: string; level: number }[] = [];
    const lines = content.split('\n');
    let currentSection = { title: '', content: '', level: 0 };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section if it has content
        if (currentSection.title || currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        
        // Start new section
        currentSection = {
          title: headerMatch[2],
          content: '',
          level: headerMatch[1].length
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    // Add the last section
    if (currentSection.title || currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const sections = parseMarkdownSections(specContent);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading specification...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Taxonomy
          </Button>
        </Link>
      </div>

      {/* Hero */}
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          <Book className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">MII Taxonomy Specification</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Technical specification for the NCSL International Measurement Information Infrastructure (MII) Measurand Taxonomy
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="text-center">
            <Info className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Introduction to digital CMC construction and measurand structure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Layers className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Structure</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Detailed specification of measurand naming and organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Code className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Implementation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Technical guidelines for implementing the taxonomy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Examples</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Real-world examples and use cases
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specification">Full Spec</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Digital CMC Construction Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Understanding the foundation of measurand taxonomy structure
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Purpose</h4>
                  <p className="text-sm text-muted-foreground">
                    Digital CMCs (Calibration and Measurement Capabilities) should unambiguously describe 
                    laboratory services for machine consumption. This taxonomy provides a standardized 
                    way to structure and identify measurands.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded p-3">
                      <h5 className="font-medium mb-1">Taxon Name</h5>
                      <p className="text-xs text-muted-foreground">
                        Unique identifier following Process.QuantityKind.Qualifiers pattern
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium mb-1">Parameters</h5>
                      <p className="text-xs text-muted-foreground">
                        Required and optional parameters that define measurement conditions
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium mb-1">Result</h5>
                      <p className="text-xs text-muted-foreground">
                        Output quantity specification with M-Layer mapping
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h5 className="font-medium mb-1">Disciplines</h5>
                      <p className="text-xs text-muted-foreground">
                        Measurement categories and scientific domains
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Naming Convention Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h5 className="font-medium">Unique Taxon Rule</h5>
                    <p className="text-sm text-muted-foreground">Every MII document identifies a measurand by the same unique taxon string</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h5 className="font-medium">Process Token Rule</h5>
                    <p className="text-sm text-muted-foreground">First token represents process type: &apos;Measure&apos; or &apos;Source&apos;</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h5 className="font-medium">CamelCase Convention</h5>
                    <p className="text-sm text-muted-foreground">Each token uses UpperCamelCase naming (e.g., FrequencyModulation)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <h5 className="font-medium">Hierarchy Rule</h5>
                    <p className="text-sm text-muted-foreground">Tokens proceed from general to specific qualifiers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Full Technical Specification</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete specification document as provided by NCSL International
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  {specContent}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Parsed Sections */}
          {sections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Document Structure</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Organized sections from the specification document
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section, index) => {
                    if (section.level <= 2 && section.title) {
                      return (
                        <div key={index} className="border-l-4 border-primary/20 pl-4">
                          <h4 className={`font-semibold ${section.level === 1 ? 'text-lg' : 'text-base'}`}>
                            {section.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {section.content.substring(0, 200)}...
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Example Taxon Structures</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real examples from the taxonomy catalog
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Temperature Measurement</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">Measure.Temperature</code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Basic temperature measurement capability
                    </p>
                    <div className="mt-3 text-xs">
                      <strong>Process:</strong> Measure (input quantity)<br/>
                      <strong>Quantity Kind:</strong> Temperature<br/>
                      <strong>Result:</strong> Temperature value in specified units<br/>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Simulated Thermocouple</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">Source.Temperature.Simulated.Thermocouple</code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Thermocouple simulation capability with specific parameters
                    </p>
                    <div className="mt-3 text-xs">
                      <strong>Process:</strong> Source (output quantity)<br/>
                      <strong>Quantity Kind:</strong> Temperature<br/>
                      <strong>Qualifiers:</strong> Simulated → Thermocouple<br/>
                      <strong>Parameters:</strong> Type, Range, Accuracy<br/>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">AC Voltage Measurement</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">Measure.Voltage.AC.Sinewave</code>
                    <p className="text-xs text-muted-foreground mt-2">
                      AC voltage measurement for sine wave signals
                    </p>
                    <div className="mt-3 text-xs">
                      <strong>Process:</strong> Measure<br/>
                      <strong>Quantity Kind:</strong> Voltage<br/>
                      <strong>Qualifiers:</strong> AC → Sinewave<br/>
                      <strong>Parameters:</strong> Frequency, Amplitude, Time<br/>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Special Token Example</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">Measure.Ratio.Voltage.AC.Sinewave.Delta.Frequency</code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ratio measurement using special &apos;Ratio&apos; token
                    </p>
                    <div className="mt-3 text-xs">
                      <strong>Process:</strong> Measure<br/>
                      <strong>Special Token:</strong> Ratio (quotient of like quantities)<br/>
                      <strong>Quantity Kind:</strong> Voltage<br/>
                      <strong>Qualifiers:</strong> AC → Sinewave → Delta → Frequency<br/>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">✅ Best Practices</h5>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Follow the exact naming convention rules</li>
                    <li>• Use parameters for details within the same process</li>
                    <li>• Link quantity kinds to M-Layer aspects</li>
                    <li>• Provide clear, unambiguous definitions</li>
                    <li>• Include all required parameters</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">❌ Common Mistakes</h5>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Using lowercase or mixed case in tokens</li>
                    <li>• Creating separate taxons for parameter variations</li>
                    <li>• Omitting the process type (Measure/Source)</li>
                    <li>• Not following hierarchical qualifier order</li>
                    <li>• Missing quantity kind specification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 