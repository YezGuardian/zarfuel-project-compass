
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contacts, Contact } from '@/data/mockData';
import { Search, Mail, Phone, Building, User } from 'lucide-react';

const ContactsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Get unique roles for filters
  const roles = Array.from(new Set(contacts.map(contact => contact.role)));
  
  // Filter contacts based on current filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = orgFilter === 'all' || contact.organization === orgFilter;
    const matchesRole = roleFilter === 'all' || contact.role === roleFilter;
    
    return matchesSearch && matchesOrg && matchesRole;
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Directory</h1>
        <p className="text-muted-foreground">
          Directory of all project team members and stakeholders
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Find Contacts</CardTitle>
          <CardDescription>Search for contacts by name or email, or filter by organization or role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="ZARSOM">ZARSOM</SelectItem>
                <SelectItem value="SAPPI">SAPPI</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted mb-4 text-2xl font-semibold text-zarfuel-blue">
                    {contact.name.split(' ').map(part => part[0]).join('')}
                  </div>
                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                  <p className="text-muted-foreground">{contact.title}</p>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="text-sm hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{contact.organization}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{contact.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No contacts found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              No contacts match your current search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
