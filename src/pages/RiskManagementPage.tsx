
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { risks, Risk } from '@/data/mockData';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const RiskManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Filter risks based on current filters
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || risk.type === typeFilter;
    const matchesImpact = impactFilter === 'all' || risk.impact === impactFilter;
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    
    return matchesSearch && matchesType && matchesImpact && matchesStatus;
  });
  
  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-status-notstarted';
      case 'medium':
        return 'bg-status-inprogress';
      case 'low':
        return 'bg-status-complete';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-status-notstarted';
      case 'mitigated':
        return 'bg-status-complete';
      case 'monitoring':
        return 'bg-status-inprogress';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Risk Management</h1>
        <p className="text-muted-foreground">
          Identify, assess and track project risks
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Risks</CardTitle>
          <CardDescription>Filter risks by type, impact level, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search risks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impacts</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="mitigated">Mitigated</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Risks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Register</CardTitle>
          <CardDescription>
            {filteredRisks.length} risk{filteredRisks.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Risk Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Impact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Mitigation Strategy</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.length > 0 ? (
                  filteredRisks.map((risk) => (
                    <tr key={risk.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm capitalize">{risk.type}</td>
                      <td className="px-4 py-3 text-sm font-medium">{risk.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 ${getImpactColor(risk.impact)}`}></div>
                          <span className="capitalize">{risk.impact}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{risk.mitigation}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(risk.status)}`}></div>
                          <span className="capitalize">{risk.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No risks found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskManagementPage;
