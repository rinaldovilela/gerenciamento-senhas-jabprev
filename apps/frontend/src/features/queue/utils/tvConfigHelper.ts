export interface TvSlideItem {
    id: string;
    title: string;
    description: string;
    tag: string;
    color: string;
    active: boolean;
}

export interface TvTickerItem {
    id: string;
    text: string;
    active: boolean;
}

export interface TvConfig {
    slides: TvSlideItem[];
    tickers: TvTickerItem[];
    slideDurationSeconds: number;
}

export const DEFAULT_TV_CONFIG: TvConfig = {
    slideDurationSeconds: 12,
    slides: [
        {
            id: '1',
            title: "Prova de Vida Online",
            description: "Agora realizada de forma eletrônica cruzando dados do Governo Federal. Sem filas, sem preocupações.\n\nAcesse nosso site e saiba mais: jabprev.jaboatao.pe.gov.br",
            tag: "Inovação JaboatãoPrev",
            color: "from-blue-900/60 to-indigo-950/60",
            active: true
        },
        {
            id: '2',
            title: "Portal do Segurado",
            description: "Acesse seus contracheques, informes de rendimento e dê entrada em serviços online: jaboataomaisfacil.jaboatao.pe.gov.br",
            tag: "Serviço Digital",
            color: "from-teal-900/60 to-emerald-950/60",
            active: true
        },
        {
            id: '3',
            title: "Prevenção e Qualidade de Vida",
            description: "Mantenha hábitos saudáveis e realize exames preventivos periódicos. Cuidar de você é o nosso compromisso.",
            tag: "Dica de Saúde",
            color: "from-rose-900/60 to-slate-950/60",
            active: true
        }
    ],
    tickers: [
        { id: '1', text: "Atenção: A Prova de Vida agora é realizada de forma automática pelo JaboatãoPrev através de cruzamento de dados federais.", active: true },
        { id: '2', text: "Acesse o Portal do Segurado: jabprev.jaboatao.pe.gov.br e consulte seu contracheque e informe de rendimentos.", active: true },
        { id: '3', text: "O JaboatãoPrev funciona de Segunda a Sexta, das 08h às 14h. Dúvidas? Fale com a Ouvidoria no Balcão de Atendimento.", active: true }
    ]
};

const TV_STORAGE_KEY = 'jabprev_tv_config';

export const getStoredTvConfig = (): TvConfig => {
    try {
        const stored = localStorage.getItem(TV_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.slides && parsed.tickers) return parsed;
        }
    } catch (e) {
        console.error('Erro ao ler config da TV:', e);
    }
    return DEFAULT_TV_CONFIG;
};

export const saveTvConfig = (config: TvConfig) => {
    try {
        localStorage.setItem(TV_STORAGE_KEY, JSON.stringify(config));
        const channel = new BroadcastChannel('jabprev_tv_channel');
        channel.postMessage({ type: 'TV_CONFIG_UPDATED', config });
        channel.close();
    } catch (e) {
        console.error('Erro ao salvar config da TV:', e);
    }
};
