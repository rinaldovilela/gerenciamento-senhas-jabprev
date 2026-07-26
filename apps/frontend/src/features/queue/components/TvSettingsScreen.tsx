import React, { useState, useEffect } from 'react';
import { 
    Tv, 
    Plus, 
    Trash2, 
    Edit, 
    Save, 
    X, 
    CheckCircle2, 
    Volume2, 
    Eye, 
    Clock, 
    Tag, 
    Layers, 
    Sparkles,
    Shield,
    Devices,
    Heart,
    MessageSquare,
    RefreshCw
} from 'lucide-react';

import { 
    type TvSlideItem, 
    type TvTickerItem, 
    type TvConfig, 
    getStoredTvConfig, 
    saveTvConfig 
} from '../utils/tvConfigHelper';

const TvSettingsScreen: React.FC = () => {
    const [config, setConfig] = useState<TvConfig>(getStoredTvConfig);
    const [activeTab, setActiveTab] = useState<'tickers' | 'slides'>('tickers');
    const [toastMessage, setToastMessage] = useState('');

    // Modal Estados para Tickers
    const [tickerText, setTickerText] = useState('');
    const [editingTickerId, setEditingTickerId] = useState<string | null>(null);

    // Modal Estados para Slides
    const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
    const [slideForm, setSlideForm] = useState<Omit<TvSlideItem, 'id'>>({
        title: '',
        description: '',
        tag: 'Aviso Institucional',
        color: 'from-blue-900/60 to-indigo-950/60',
        active: true,
    });

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleSaveConfig = (newConfig: TvConfig) => {
        setConfig(newConfig);
        saveTvConfig(newConfig);
        showToast('Configurações salvas e transmitidas para o Painel TV!');
    };

    // FUNÇÕES DE TICKER
    const handleAddOrUpdateTicker = () => {
        if (!tickerText.trim()) return;

        let nextTickers: TvTickerItem[];
        if (editingTickerId) {
            nextTickers = config.tickers.map(t => t.id === editingTickerId ? { ...t, text: tickerText.trim() } : t);
        } else {
            nextTickers = [...config.tickers, { id: Date.now().toString(), text: tickerText.trim(), active: true }];
        }

        handleSaveConfig({ ...config, tickers: nextTickers });
        setTickerText('');
        setEditingTickerId(null);
    };

    const handleToggleTicker = (id: string) => {
        const nextTickers = config.tickers.map(t => t.id === id ? { ...t, active: !t.active } : t);
        handleSaveConfig({ ...config, tickers: nextTickers });
    };

    const handleDeleteTicker = (id: string) => {
        const nextTickers = config.tickers.filter(t => t.id !== id);
        handleSaveConfig({ ...config, tickers: nextTickers });
    };

    // FUNÇÕES DE SLIDES
    const handleAddOrUpdateSlide = () => {
        if (!slideForm.title.trim()) return;

        let nextSlides: TvSlideItem[];
        if (editingSlideId) {
            nextSlides = config.slides.map(s => s.id === editingSlideId ? { ...s, ...slideForm } : s);
        } else {
            nextSlides = [...config.slides, { id: Date.now().toString(), ...slideForm }];
        }

        handleSaveConfig({ ...config, slides: nextSlides });
        setEditingSlideId(null);
        setSlideForm({ title: '', description: '', tag: 'Aviso Institucional', color: 'from-blue-900/60 to-indigo-950/60', active: true });
    };

    const handleToggleSlide = (id: string) => {
        const nextSlides = config.slides.map(s => s.id === id ? { ...s, active: !s.active } : s);
        handleSaveConfig({ ...config, slides: nextSlides });
    };

    const handleDeleteSlide = (id: string) => {
        const nextSlides = config.slides.filter(s => s.id !== id);
        handleSaveConfig({ ...config, slides: nextSlides });
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto w-full text-slate-100 pb-8">
            {toastMessage && (
                <div className="fixed bottom-6 right-6 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 px-6 py-3.5 rounded-2xl shadow-2xl z-50 animate-fade-in-up text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                <div>
                    <h1 className="font-montserrat text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Tv size={28} className="text-amber-400" />
                        Gestão do Painel TV & Letreiro
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                        Gerencie em tempo real as frases rolantes do rodapé e os anúncios exibidos na TV do atendimento.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-900/80 p-1 border border-white/10 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('tickers')}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'tickers' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            Letreiro de Rodapé ({config.tickers.filter(t => t.active).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('slides')}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'slides' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            Anúncios Institucionais ({config.slides.filter(s => s.active).length})
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO DA ABA 1: LETREIRO DE RODAPÉ (TICKER) */}
            {activeTab === 'tickers' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Lista de Frases (7 cols) */}
                    <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={16} className="text-amber-400" />
                                Frases do Letreiro em Exibição
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                                Sincronização Live
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                            {config.tickers.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                                        item.active 
                                            ? 'bg-slate-950/60 border-white/10 hover:border-white/20' 
                                            : 'bg-slate-950/20 border-white/5 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-xs text-slate-200 font-medium leading-relaxed">{item.text}</p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleToggleTicker(item.id)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                                                item.active 
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                            }`}
                                        >
                                            {item.active ? 'Ativo' : 'Oculto'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingTickerId(item.id);
                                                setTickerText(item.text);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTicker(item.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formulário de Frase (5 cols) */}
                    <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl h-fit space-y-4">
                        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                            {editingTickerId ? <Edit size={16} className="text-amber-400" /> : <Plus size={16} className="text-amber-400" />}
                            {editingTickerId ? 'Editar Frase do Letreiro' : 'Adicionar Nova Frase'}
                        </h3>

                        <textarea
                            rows={4}
                            placeholder="Digite a mensagem que irá rolar no rodapé da TV..."
                            value={tickerText}
                            onChange={(e) => setTickerText(e.target.value)}
                            className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:border-amber-500/50 outline-none transition-all resize-none leading-relaxed"
                        />

                        <div className="flex gap-2">
                            {editingTickerId && (
                                <button
                                    onClick={() => {
                                        setEditingTickerId(null);
                                        setTickerText('');
                                    }}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                onClick={handleAddOrUpdateTicker}
                                disabled={!tickerText.trim()}
                                className="flex-1 py-3 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save size={15} />
                                <span>{editingTickerId ? 'Salvar Frase' : 'Adicionar Frase'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO DA ABA 2: ANÚNCIOS INSTITUCIONAIS (SLIDES) */}
            {activeTab === 'slides' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Lista de Slides (7 cols) */}
                    <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers size={16} className="text-amber-400" />
                                Comunicados e Anúncios na TV
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold">Rotação:</span>
                                <select
                                    value={config.slideDurationSeconds}
                                    onChange={(e) => handleSaveConfig({ ...config, slideDurationSeconds: Number(e.target.value) })}
                                    className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-xs text-amber-400 font-bold outline-none"
                                >
                                    <option value={8}>8 Segundos</option>
                                    <option value={12}>12 Segundos</option>
                                    <option value={15}>15 Segundos</option>
                                    <option value={20}>20 Segundos</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                            {config.slides.map((slide) => (
                                <div
                                    key={slide.id}
                                    className={`p-5 rounded-3xl border bg-gradient-to-r ${slide.color} backdrop-blur-md transition-all flex flex-col justify-between gap-4 ${
                                        slide.active ? 'border-white/15 shadow-xl' : 'border-white/5 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <span className="inline-block px-2.5 py-0.5 bg-black/40 border border-white/10 rounded-md text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-2">
                                                {slide.tag}
                                            </span>
                                            <h4 className="text-base font-extrabold text-white">{slide.title}</h4>
                                            <p className="text-xs text-slate-300 mt-1 whitespace-pre-line leading-relaxed">{slide.description}</p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleToggleSlide(slide.id)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                                                    slide.active ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-white/10 text-slate-400'
                                                }`}
                                            >
                                                {slide.active ? 'Ativo' : 'Oculto'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingSlideId(slide.id);
                                                    setSlideForm({
                                                        title: slide.title,
                                                        description: slide.description,
                                                        tag: slide.tag,
                                                        color: slide.color,
                                                        active: slide.active
                                                    });
                                                }}
                                                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSlide(slide.id)}
                                                className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formulário de Slide (5 cols) */}
                    <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl h-fit space-y-4">
                        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                            {editingSlideId ? <Edit size={16} className="text-amber-400" /> : <Plus size={16} className="text-amber-400" />}
                            {editingSlideId ? 'Editar Anúncio' : 'Adicionar Novo Anúncio'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Título do Anúncio *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Atualização Cadastral"
                                    value={slideForm.title}
                                    onChange={(e) => setSlideForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoria / Tag *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Aviso Importante, Dica de Saúde, Recado"
                                    value={slideForm.tag}
                                    onChange={(e) => setSlideForm(f => ({ ...f, tag: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrição / Mensagem</label>
                                <textarea
                                    rows={4}
                                    placeholder="Texto completo exibido no slide da TV..."
                                    value={slideForm.description}
                                    onChange={(e) => setSlideForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none transition-all resize-none leading-relaxed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estilo de Cor do Card</label>
                                <select
                                    value={slideForm.color}
                                    onChange={(e) => setSlideForm(f => ({ ...f, color: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500/50 outline-none cursor-pointer"
                                >
                                    <option value="from-blue-900/60 to-indigo-950/60">Azul Marinho / Indigo (Institucional)</option>
                                    <option value="from-teal-900/60 to-emerald-950/60">Verde Esmeralda (Serviço Digital)</option>
                                    <option value="from-rose-900/60 to-slate-950/60">Vinho / Rosa (Saúde / Atenção)</option>
                                    <option value="from-amber-900/60 to-slate-950/60">Dourado / Âmbar (Aviso Urgente)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            {editingSlideId && (
                                <button
                                    onClick={() => {
                                        setEditingSlideId(null);
                                        setSlideForm({ title: '', description: '', tag: 'Aviso Institucional', color: 'from-blue-900/60 to-indigo-950/60', active: true });
                                    }}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                onClick={handleAddOrUpdateSlide}
                                disabled={!slideForm.title.trim()}
                                className="flex-1 py-3 bg-gradient-to-r from-jaboatao-yellow to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save size={15} />
                                <span>{editingSlideId ? 'Salvar Anúncio' : 'Adicionar Anúncio'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TvSettingsScreen;
