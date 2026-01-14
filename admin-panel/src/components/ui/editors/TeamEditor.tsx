import { useState } from 'react';
import {
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
} from 'lucide-react';
import { type TeamComponentData } from '../../../store/pageComponents';
import Button from '../../ui/button/Button';
import MediaSelector from '../content/MediaSelector';

interface TeamEditorProps {
  data: TeamComponentData;
  onChange: (data: TeamComponentData) => void;
}

export default function TeamEditor({ data, onChange }: TeamEditorProps) {
  const [formData, setFormData] = useState<TeamComponentData>({
    title: data.title || 'Nasz zespół',
    subtitle: data.subtitle || '',
    members: data.members || [],
    layout: data.layout || 'grid',
    columns: data.columns || 3,
  });

  const handleChange = (field: keyof TeamComponentData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const addMember = () => {
    const newMember = {
      name: 'Nowy członek',
      role: 'Stanowisko',
      bio: '',
      media_id: undefined,
      email: '',
      phone: '',
      social: {},
    };

    handleChange('members', [...formData.members, newMember]);
  };

  const updateMember = (index: number, updates: any) => {
    const updatedMembers = formData.members.map((member, i) =>
      i === index ? { ...member, ...updates } : member
    );
    handleChange('members', updatedMembers);
  };

  const removeMember = (index: number) => {
    handleChange(
      'members',
      formData.members.filter((_, i) => i !== index)
    );
  };

  const updateSocial = (memberIndex: number, platform: string, value: string) => {
    const member = formData.members[memberIndex];
    const social = { ...member.social, [platform]: value };
    updateMember(memberIndex, { social });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tytuł sekcji
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="np. Poznaj nasz zespół"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Podtytuł
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="np. Ludzie, którzy tworzą naszą firmę"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Układ
          </label>
          <select
            value={formData.layout}
            onChange={(e) => handleChange('layout', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="grid">Siatka</option>
            <option value="list">Lista</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kolumny (siatka)
          </label>
          <select
            value={formData.columns}
            onChange={(e) => handleChange('columns', parseInt(e.target.value))}
            disabled={formData.layout === 'list'}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            <option value={2}>2 kolumny</option>
            <option value={3}>3 kolumny</option>
            <option value={4}>4 kolumny</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Członkowie zespołu ({formData.members.length})
          </label>
          <Button size="sm" variant="primary" startIcon={<Plus />} onClick={addMember}>
            Dodaj osobę
          </Button>
        </div>

        {formData.members.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Brak członków zespołu. Dodaj pierwszą osobę.
            </p>
            <Button size="sm" variant="primary" onClick={addMember}>
              Dodaj pierwszą osobę
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.members.map((member, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Imię i nazwisko *
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(index, { name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stanowisko *
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateMember(index, { role: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio / Opis
                  </label>
                  <textarea
                    value={member.bio || ''}
                    onChange={(e) => updateMember(index, { bio: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Krótki opis doświadczenia..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zdjęcie
                  </label>
                  <MediaSelector
                    selectedMediaId={member.media_id}
                    onSelect={(mediaId) => updateMember(index, { media_id: mediaId })}
                    onRemove={() => updateMember(index, { media_id: undefined })}
                    allowedTypes={['image']}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={member.email || ''}
                      onChange={(e) => updateMember(index, { email: e.target.value })}
                      placeholder="anna@firma.pl"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={member.phone || ''}
                      onChange={(e) => updateMember(index, { phone: e.target.value })}
                      placeholder="+48 123 456 789"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media społecznościowe
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      <input
                        type="url"
                        value={member.social?.linkedin || ''}
                        onChange={(e) => updateSocial(index, 'linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <input
                        type="url"
                        value={member.social?.twitter || ''}
                        onChange={(e) => updateSocial(index, 'twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-700" />
                      <input
                        type="url"
                        value={member.social?.facebook || ''}
                        onChange={(e) => updateSocial(index, 'facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <input
                        type="url"
                        value={member.social?.instagram || ''}
                        onChange={(e) => updateSocial(index, 'instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
