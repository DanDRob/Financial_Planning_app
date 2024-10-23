import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calculator, DollarSign, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { DataTable } from '../shared/DataTable';

export const DataInputTab = ({ data, onUpdate }) => {
  const [uploadError, setUploadError] = useState(null);

  const handleInputChange = (field, value) => {
    onUpdate({
      [field]: parseFloat(value) || 0
    });
  };

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      // Process file upload
      setUploadError(null);
    } catch (error) {
      setUploadError('Error uploading file. Please try again.');
      console.error('File upload error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Savings</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={data.savings}
                  onChange={(e) => handleInputChange('savings', e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Monthly Income</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={data.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Monthly Expenses</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={data.monthlyExpenses}
                  onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Target Retirement Age</label>
              <div className="relative mt-1">
                <Calculator className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={data.retirementAge}
                  onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                  className="pl-8"
                  placeholder="65"
                  min="30"
                  max="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investment Data Import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button variant="outline" onClick={() => document.getElementById('file-upload').click()}>
                    Choose File
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".csv,.xlsx"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Supported formats: CSV, Excel
                </p>
              </div>

              {uploadError && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Investment Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.investments || []}
            columns={[
              { header: 'Asset Name', accessor: 'name' },
              { header: 'Amount', accessor: 'amount', type: 'currency' },
              { header: 'Allocation', accessor: 'allocation', type: 'percentage' },
              { header: 'Annual Return', accessor: 'return', type: 'percentage' }
            ]}
            onUpdate={(rowIndex, field, value) => {
              const updatedInvestments = [...(data.investments || [])];
              updatedInvestments[rowIndex] = {
                ...updatedInvestments[rowIndex],
                [field]: value
              };
              onUpdate({ investments: updatedInvestments });
            }}
            editable={true}
          />

          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                const newInvestments = [...(data.investments || [])];
                newInvestments.push({
                  name: '',
                  amount: 0,
                  allocation: 0,
                  return: 0
                });
                onUpdate({ investments: newInvestments });
              }}
            >
              Add Investment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};