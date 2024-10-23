import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, Save, Settings } from 'lucide-react';
import React from 'react';

export const ControlPanel = ({
  settings,
  onChange,
  disabled = false,
  className = '',
  showResetButton = true,
  showSaveButton = false,
  onSave,
  onReset
}) => {
  const getControlType = (key, value) => {
    if (typeof value === 'boolean') return 'switch';
    if (typeof value === 'number') {
      if (value <= 1 && value >= 0) return 'percentage';
      return 'number';
    }
    if (Array.isArray(value)) return 'multi-select';
    if (typeof value === 'object') return 'nested';
    return 'select';
  };

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const getOptionsForSetting = (key) => {
    switch (key) {
      case 'rebalanceFrequency':
        return [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'annually', label: 'Annually' }
        ];
      case 'riskLevel':
        return [
          { value: 'conservative', label: 'Conservative' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'aggressive', label: 'Aggressive' }
        ];
      case 'taxStrategy':
        return [
          { value: 'harvesting', label: 'Tax-Loss Harvesting' },
          { value: 'deferral', label: 'Tax Deferral' },
          { value: 'balanced', label: 'Balanced Approach' }
        ];
      case 'investmentStyle':
        return [
          { value: 'passive', label: 'Passive' },
          { value: 'active', label: 'Active' },
          { value: 'hybrid', label: 'Hybrid' }
        ];
      default:
        return [];
    }
  };

  const validateSetting = (key, value, type) => {
    switch (type) {
      case 'percentage':
        return value >= 0 && value <= 1;
      case 'number':
        return !isNaN(value) && isFinite(value);
      case 'select':
        return getOptionsForSetting(key).some(option => option.value === value);
      default:
        return true;
    }
  };

  const renderControl = (key, value, path = '') => {
    const controlType = getControlType(key, value);
    const fullPath = path ? `${path}.${key}` : key;

    const handleChange = (newValue) => {
      if (!validateSetting(key, newValue, controlType)) {
        console.warn(`Invalid value for ${key}: ${newValue}`);
        return;
      }

      if (path) {
        const pathParts = path.split('.');
        const newSettings = { ...settings };
        let current = newSettings;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        current[key] = newValue;
        onChange(newSettings);
      } else {
        onChange({ ...settings, [key]: newValue });
      }
    };

    switch (controlType) {
      case 'switch':
        return (
          <div className="flex items-center justify-between py-2">
            <Label htmlFor={fullPath} className="flex-grow">
              {formatLabel(key)}
            </Label>
            <Switch
              id={fullPath}
              checked={value}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={fullPath}>{formatLabel(key)}</Label>
              <span className="text-sm text-gray-500">
                {(value * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              id={fullPath}
              value={[value * 100]}
              onValueChange={([newValue]) => handleChange(newValue / 100)}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2 py-2">
            <Label htmlFor={fullPath}>{formatLabel(key)}</Label>
            <Input
              id={fullPath}
              type="number"
              value={value}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2 py-2">
            <Label htmlFor={fullPath}>{formatLabel(key)}</Label>
            <Select
              value={value}
              onValueChange={handleChange}
              disabled={disabled}
            >
              <SelectTrigger id={fullPath}>
                <SelectValue placeholder={`Select ${formatLabel(key)}`} />
              </SelectTrigger>
              <SelectContent>
                {getOptionsForSetting(key).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-2 py-2">
            <Label htmlFor={fullPath}>{formatLabel(key)}</Label>
            <Select
              value={value}
              onValueChange={handleChange}
              disabled={disabled}
              multiple
            >
              <SelectTrigger id={fullPath}>
                <SelectValue placeholder={`Select ${formatLabel(key)}`} />
              </SelectTrigger>
              <SelectContent>
                {getOptionsForSetting(key).map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'nested':
        return (
          <div className="space-y-4 border-l-2 pl-4 mt-4">
            <Label className="font-medium">{formatLabel(key)}</Label>
            {Object.entries(value).map(([nestedKey, nestedValue]) => (
              <div key={nestedKey}>
                {renderControl(nestedKey, nestedValue, fullPath)}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      // Default reset behavior
      const defaultSettings = Object.keys(settings).reduce((acc, key) => {
        const value = settings[key];
        if (typeof value === 'boolean') acc[key] = false;
        if (typeof value === 'number') acc[key] = 0;
        if (typeof value === 'string') acc[key] = '';
        if (Array.isArray(value)) acc[key] = [];
        if (typeof value === 'object') acc[key] = {};
        return acc;
      }, {});
      onChange(defaultSettings);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Controls</span>
          </div>
          <div className="flex gap-2">
            {showResetButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            {showSaveButton && onSave && (
              <Button
                variant="default"
                size="sm"
                onClick={onSave}
                disabled={disabled}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>

        {disabled && (
          <Alert className="mb-4">
            <AlertDescription>
              Controls are currently disabled
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key}>
              {renderControl(key, value)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;