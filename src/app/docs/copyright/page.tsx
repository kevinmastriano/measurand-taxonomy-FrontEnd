'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, CreativeCommons } from 'lucide-react';
import Link from 'next/link';
import { loadDocumentContent } from '@/lib/taxonomy-data';

export default function CopyrightPage() {
  const [copyrightContent, setCopyrightContent] = useState('');
  const [licenseContent, setLicenseContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const [copyright, license] = await Promise.all([
          loadDocumentContent('COPYRIGHT'),
          loadDocumentContent('LICENSE')
        ]);
        
        setCopyrightContent(copyright);
        setLicenseContent(license);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading documentation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
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
          <Scale className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Copyright & License</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Legal information, usage rights, and licensing terms for the NCSLI MII Measurand Taxonomy
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="text-center">
            <CreativeCommons className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">CC BY-SA 4.0</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
            </p>
            <a 
              href="https://creativecommons.org/licenses/by-sa/4.0/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              View License
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">NCSL International</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Copyright © 2024 by NCSL International. All rights reserved.
            </p>
            <a 
              href="https://ncsli.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              Visit NCSLI
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Documentation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              View the complete technical specification and documentation.
            </p>
            <Link href="/docs/specification">
              <Button variant="outline" size="sm">
                View Specification
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Detailed License Information */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreativeCommons className="h-6 w-6" />
              Creative Commons License Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">You are free to:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Share</strong> — copy and redistribute the material in any medium or format</li>
                  <li><strong>Adapt</strong> — remix, transform, and build upon the material</li>
                  <li>for any purpose, even commercially.</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Under the following terms:</h4>
                <ul className="text-sm text-orange-800 space-y-2">
                  <li>
                    <strong>Attribution</strong> — You must give appropriate credit, provide a link to the license, 
                    and indicate if changes were made. You may do so in any reasonable manner, but not in any way 
                    that suggests the licensor endorses you or your use.
                  </li>
                  <li>
                    <strong>ShareAlike</strong> — If you remix, transform, or build upon the material, you must 
                    distribute your contributions under the same license as the original.
                  </li>
                  <li>
                    <strong>No additional restrictions</strong> — You may not apply legal terms or technological 
                    measures that legally restrict others from doing anything the license permits.
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">How to cite this work:</h4>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  NCSLI MII Measurand Taxonomy Catalog. Available under CC BY-SA 4.0 License.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copyright Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Copyright Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {copyrightContent}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* License Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Full License Text
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Creative Commons Attribution-ShareAlike 4.0 International Public License
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                {licenseContent}
              </pre>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Summary of License Terms</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <div><strong>✓ You are free to:</strong></div>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Share</strong> — copy and redistribute the material in any medium or format</li>
                  <li><strong>Adapt</strong> — remix, transform, and build upon the material</li>
                </ul>
                
                <div className="mt-3"><strong>⚠ Under the following terms:</strong></div>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Attribution</strong> — You must give appropriate credit and indicate if changes were made</li>
                  <li><strong>ShareAlike</strong> — If you adapt the material, you must distribute under the same license</li>
                  <li><strong>No additional restrictions</strong> — You may not apply legal terms that restrict others</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attribution Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Attribution Guidelines</CardTitle>
            <p className="text-sm text-muted-foreground">
              How to properly attribute this work when using or sharing
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Minimum Attribution Requirements:</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p className="mb-2">
                    <strong>&quot;NCSLI MII Measurand Taxonomy&quot;</strong> by NCSL International, 
                    licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/" className="text-primary hover:underline">CC BY-SA 4.0</a>
                  </p>
                  <p className="text-muted-foreground">
                    Include this attribution notice when using or sharing this taxonomy.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">For Academic Use:</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p>
                    NCSL International. (2024). <em>NCSLI MII Measurand Taxonomy</em>. 
                    Licensed under CC BY-SA 4.0. Available at: [URL]
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">For Software/Web Use:</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
                  {`<!-- Attribution for NCSLI MII Measurand Taxonomy -->
<!-- Copyright © 2024 NCSL International -->
<!-- Licensed under CC BY-SA 4.0 -->
<!-- Source: [URL] -->`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 