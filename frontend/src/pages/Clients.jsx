import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClients } from '../api';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const res = await getClients(searchTerm);
        if (res.success) {
          setClients(res.clients);
        }
      } catch (err) {
        console.error("Fetch clients failed");
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(fetchClients, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="clients-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Client Directory</h1>
          <p className="subtext">Manage personal details and contact information for your clients.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Add Client</span>
        </button>
      </header>

      <div className="filters-bar glass">
        <div className="search-bar">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search clients by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="clients-grid">
        {isLoading ? (
          <div className="col-span-full flex justify-center p-12">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
          </div>
        ) : (
          <AnimatePresence>
            {clients.map((client, i) => (
              <motion.div 
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="client-card glass"
              >
                <div className="client-header">
                  <div className="client-avatar">
                    <User size={24} />
                  </div>
                  <div className="client-main-info">
                    <h3 className="client-name">{client.name}</h3>
                    <p className="client-occupation">{client.occupation || 'Private Client'}</p>
                  </div>
                  <button className="icon-button"><ExternalLink size={16} /></button>
                </div>
                
                <div className="client-contact-list">
                  <div className="contact-item">
                    <Mail size={14} />
                    <span>{client.email || 'No email provided'}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{client.phone || 'No phone provided'}</span>
                  </div>
                  <div className="contact-item">
                    <MapPin size={14} />
                    <span className="truncate">{client.address || 'No address set'}</span>
                  </div>
                </div>

                <div className="client-footer">
                  <button className="text-btn text-sm">View Linked Cases</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {!isLoading && clients.length === 0 && (
        <div className="empty-state glass">
          <User size={64} className="text-muted mb-1" />
          <p>No clients found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Clients;
