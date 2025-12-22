import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { teamService } from '../services/team.service';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  teamId: string | null;
  teamName?: string;
  hackathonId?: string | null;
}

const InviteModal: React.FC<InviteModalProps> = ({ open, onClose, teamId, teamName, hackathonId }) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSend = async () => {
    if (!teamId) return;
    if (!email || !email.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    try {
      setIsSending(true);
      setError(null);
      try { if (hackathonId) localStorage.setItem('selectedHackathonId', hackathonId); } catch(e) {}
      await teamService.inviteMember(teamId, email);
      alert(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (err: any) {
      console.error('Invite failed', err);
      setError(err?.message || 'Failed to send invite');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Invite participant to {teamName || 'team'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Enter participant email to send an invite link. They can accept via email and join the team.</p>
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="participant@example.com"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100">Cancel</button>
            <button onClick={handleSend} disabled={isSending} className="px-4 py-2 rounded-lg bg-primary text-white flex items-center gap-2">
              {isSending ? 'Sending...' : <>Send Invite <Send size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
