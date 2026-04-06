/**
 * CALCULADORA MODERNA
 * JavaScript puro com suporte a teclado e temas
 */

// ========================================
// CLASSE PRINCIPAL DA CALCULADORA
// ========================================

class Calculator {
  constructor() {
    // Elementos do DOM
    this.previousOperandElement = document.getElementById('previousOperand');
    this.currentOperandElement = document.getElementById('currentOperand');
    this.themeToggle = document.getElementById('themeToggle');
    this.display = document.querySelector('.display');
    this.copyBtn = document.getElementById('copyBtn');
    this.historyList = document.getElementById('historyList');
    this.historyEmpty = document.getElementById('historyEmpty');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Estado da calculadora
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
    
    // Histórico de operações (máximo 20 itens)
    this.history = [];
    this.maxHistoryItems = 20;
    
    // Limite máximo de dígitos
    this.maxDigits = 15;
    
    // Inicializar
    this.init();
  }

  /**
   * Inicializa os event listeners
   */
  init() {
    // Listeners para botões
    this.setupButtonListeners();
    
    // Listener para teclado
    this.setupKeyboardListeners();
    
    // Listener para tema
    this.setupThemeToggle();
    
    // Listener para copiar
    this.setupCopyButton();
    
    // Listener para histórico
    this.setupHistoryListeners();
    
    // Carregar tema salvo
    this.loadSavedTheme();
    
    // Carregar histórico salvo
    this.loadSavedHistory();
  }

  /**
   * Configura os listeners dos botões
   */
  setupButtonListeners() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        // Feedback visual
        this.addPressedEffect(button);
        
        // Executar ação baseada no tipo do botão
        switch (action) {
          case 'number':
            this.appendNumber(value);
            break;
          case 'operator':
            this.chooseOperation(value);
            break;
          case 'equals':
            this.calculate();
            break;
          case 'clear':
            this.clear();
            break;
          case 'delete':
            this.delete();
            break;
          case 'decimal':
            this.appendDecimal();
            break;
          case 'percent':
            this.percent();
            break;
        }
        
        this.updateDisplay();
      });
    });
  }

  /**
   * Configura os listeners do teclado
   */
  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      // Prevenir comportamento padrão para algumas teclas
      if (['/', '*', '+', '-', 'Enter', 'Backspace'].includes(e.key)) {
        e.preventDefault();
      }
      
      // Números 0-9
      if (/^[0-9]$/.test(e.key)) {
        this.highlightButton(`[data-value="${e.key}"]`);
        this.appendNumber(e.key);
      }
      
      // Ponto decimal
      if (e.key === '.' || e.key === ',') {
        this.highlightButton('[data-action="decimal"]');
        this.appendDecimal();
      }
      
      // Operadores
      const operatorMap = {
        '+': '+',
        '-': '-',
        '*': '×',
        'x': '×',
        'X': '×',
        '/': '÷'
      };
      
      if (operatorMap[e.key]) {
        this.highlightButton(`[data-value="${operatorMap[e.key]}"]`);
        this.chooseOperation(operatorMap[e.key]);
      }
      
      // Enter ou = para calcular
      if (e.key === 'Enter' || e.key === '=') {
        this.highlightButton('[data-action="equals"]');
        this.calculate();
      }
      
      // Backspace para deletar
      if (e.key === 'Backspace') {
        this.highlightButton('[data-action="delete"]');
        this.delete();
      }
      
      // Escape ou C para limpar
      if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        this.highlightButton('[data-action="clear"]');
        this.clear();
      }
      
      // Porcentagem
      if (e.key === '%') {
        this.highlightButton('[data-action="percent"]');
        this.percent();
      }
      
      this.updateDisplay();
    });
  }

  /**
   * Destaca o botão quando pressionado via teclado
   */
  highlightButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
      this.addPressedEffect(button);
    }
  }

  /**
   * Adiciona efeito visual de pressionar
   */
  addPressedEffect(button) {
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);
  }

  /**
   * Adiciona um número ao operando atual
   */
  appendNumber(number) {
    // Resetar tela se necessário (após uma operação)
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }
    
    // Prevenir múltiplos zeros no início
    if (number === '0' && this.currentOperand === '0') return;
    if (number === '00' && this.currentOperand === '0') return;
    
    // Limitar quantidade de dígitos
    if (this.currentOperand.replace('.', '').length >= this.maxDigits) return;
    
    // Substituir zero inicial
    if (this.currentOperand === '0' && number !== '00') {
      this.currentOperand = number;
    } else {
      this.currentOperand += number;
    }
  }

  /**
   * Adiciona ponto decimal
   */
  appendDecimal() {
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
    }
    
    // Prevenir múltiplos pontos decimais
    if (this.currentOperand.includes('.')) return;
    
    this.currentOperand += '.';
  }

  /**
   * Escolhe a operação matemática
   */
  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    
    // Se já existe uma operação pendente, calcular primeiro
    if (this.previousOperand !== '') {
      this.calculate();
    }
    
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
  }

  /**
   * Realiza o cálculo
   */
  calculate() {
    if (this.operation === null || this.previousOperand === '') return;
    
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    let result;
    
    // Verificar números válidos
    if (isNaN(prev) || isNaN(current)) return;
    
    // Guardar expressão para o histórico
    const expression = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation} ${this.formatDisplayNumber(this.currentOperand)}`;
    
    // Executar operação
    switch (this.operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        // Prevenção de divisão por zero
        if (current === 0) {
          this.showError();
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }
    
    // Formatar resultado (limitar casas decimais)
    this.currentOperand = this.formatResult(result);
    
    // Adicionar ao histórico
    this.addToHistory(expression, this.currentOperand);
    
    // Mostrar animação de resultado
    this.showResultAnimation();
    
    // Resetar estado
    this.operation = null;
    this.previousOperand = '';
    this.shouldResetScreen = true;
  }

  /**
   * Formata o resultado para evitar números muito longos
   */
  formatResult(number) {
    // Verificar se é um número válido
    if (!isFinite(number)) {
      return 'Erro';
    }
    
    // Converter para string e verificar tamanho
    let result = number.toString();
    
    // Se o número for muito grande ou muito pequeno, usar notação científica
    if (Math.abs(number) > 999999999999999 || (Math.abs(number) < 0.000001 && number !== 0)) {
      result = number.toExponential(6);
    } else {
      // Limitar casas decimais para evitar problemas de ponto flutuante
      const rounded = Math.round(number * 1000000000) / 1000000000;
      result = rounded.toString();
      
      // Limitar comprimento total
      if (result.length > this.maxDigits) {
        const decimals = Math.max(0, this.maxDigits - result.split('.')[0].length - 1);
        result = number.toFixed(decimals);
      }
    }
    
    return result;
  }

  /**
   * Mostra erro (ex: divisão por zero)
   */
  showError() {
    this.currentOperand = 'Erro';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = true;
    
    // Animação de shake
    this.display.classList.add('error');
    setTimeout(() => this.display.classList.remove('error'), 500);
    
    this.updateDisplay();
  }

  /**
   * Animação ao mostrar resultado
   */
  showResultAnimation() {
    this.display.classList.add('result');
    setTimeout(() => this.display.classList.remove('result'), 500);
  }

  /**
   * Limpa toda a calculadora
   */
  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
  }

  /**
   * Deleta o último dígito
   */
  delete() {
    if (this.currentOperand === 'Erro') {
      this.clear();
      return;
    }
    
    if (this.shouldResetScreen) return;
    
    this.currentOperand = this.currentOperand.slice(0, -1);
    
    // Se ficou vazio, mostrar zero
    if (this.currentOperand === '' || this.currentOperand === '-') {
      this.currentOperand = '0';
    }
  }

  /**
   * Calcula porcentagem
   */
  percent() {
    if (this.currentOperand === '' || this.currentOperand === 'Erro') return;
    
    const current = parseFloat(this.currentOperand);
    
    if (this.previousOperand !== '' && this.operation) {
      // Se há uma operação pendente, calcular porcentagem do valor anterior
      const prev = parseFloat(this.previousOperand);
      this.currentOperand = this.formatResult((prev * current) / 100);
    } else {
      // Simplesmente dividir por 100
      this.currentOperand = this.formatResult(current / 100);
    }
    
    this.shouldResetScreen = true;
  }

  /**
   * Atualiza o display
   */
  updateDisplay() {
    // Formatar número com separadores de milhar para exibição
    this.currentOperandElement.textContent = this.formatDisplayNumber(this.currentOperand);
    
    // Mostrar operação anterior
    if (this.operation !== null) {
      this.previousOperandElement.textContent = 
        `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.textContent = '';
    }
  }

  /**
   * Formata número para exibição (com separadores de milhar)
   */
  formatDisplayNumber(number) {
    if (number === 'Erro') return number;
    
    const stringNumber = number.toString();
    
    // Separar parte inteira e decimal
    const [integerPart, decimalPart] = stringNumber.split('.');
    
    // Formatar parte inteira com separadores de milhar
    const formattedInteger = parseInt(integerPart).toLocaleString('pt-BR');
    
    // Se houver parte decimal, adicionar
    if (decimalPart !== undefined) {
      return `${formattedInteger},${decimalPart}`;
    }
    
    // Se termina com ponto (usuário acabou de digitar), manter o ponto
    if (stringNumber.endsWith('.')) {
      return `${formattedInteger},`;
    }
    
    return formattedInteger;
  }

  /**
   * Configura o toggle de tema
   */
  setupThemeToggle() {
    this.themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('calculator-theme', newTheme);
    });
  }

  /**
   * Carrega tema salvo no localStorage
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('calculator-theme');
    
    // Se não há tema salvo, verificar preferência do sistema
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  // ========================================
  // FUNCIONALIDADE DE COPIAR
  // ========================================

  /**
   * Configura o botão de copiar
   */
  setupCopyButton() {
    this.copyBtn.addEventListener('click', () => {
      this.copyResult();
    });
  }

  /**
   * Copia o resultado atual para a área de transferência
   */
  async copyResult() {
    // Não copiar se for erro ou zero inicial
    if (this.currentOperand === 'Erro') return;
    
    // Pegar o valor numérico (sem formatação de exibição)
    const valueToCopy = this.currentOperand;
    
    try {
      await navigator.clipboard.writeText(valueToCopy);
      this.showCopyFeedback();
    } catch (err) {
      // Fallback para navegadores mais antigos
      this.fallbackCopy(valueToCopy);
    }
  }

  /**
   * Fallback para copiar em navegadores sem suporte a clipboard API
   */
  fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopyFeedback();
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
    
    document.body.removeChild(textArea);
  }

  /**
   * Mostra feedback visual de copiado
   */
  showCopyFeedback() {
    this.copyBtn.classList.add('copied');
    
    setTimeout(() => {
      this.copyBtn.classList.remove('copied');
    }, 2000);
  }

  // ========================================
  // FUNCIONALIDADE DE HISTORICO
  // ========================================

  /**
   * Configura os listeners do histórico
   */
  setupHistoryListeners() {
    // Botão limpar histórico
    this.clearHistoryBtn.addEventListener('click', () => {
      this.clearHistory();
    });
  }

  /**
   * Adiciona um cálculo ao histórico
   */
  addToHistory(expression, result) {
    const historyItem = {
      expression,
      result,
      timestamp: Date.now()
    };
    
    // Adicionar no início do array
    this.history.unshift(historyItem);
    
    // Limitar tamanho do histórico
    if (this.history.length > this.maxHistoryItems) {
      this.history.pop();
    }
    
    // Salvar no localStorage
    this.saveHistory();
    
    // Atualizar UI
    this.renderHistory();
  }

  /**
   * Renderiza a lista de histórico na UI
   */
  renderHistory() {
    // Limpar lista atual
    this.historyList.innerHTML = '';
    
    // Mostrar/esconder mensagem de vazio
    if (this.history.length === 0) {
      this.historyEmpty.classList.remove('hidden');
      return;
    }
    
    this.historyEmpty.classList.add('hidden');
    
    // Criar elementos para cada item
    this.history.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.setAttribute('data-index', index);
      li.setAttribute('tabindex', '0');
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', `Usar resultado ${this.formatDisplayNumber(item.result)}`);
      
      li.innerHTML = `
        <div class="history-expression">${item.expression} =</div>
        <div class="history-result">${this.formatDisplayNumber(item.result)}</div>
      `;
      
      // Listener para clicar no item
      li.addEventListener('click', () => {
        this.useHistoryItem(item);
      });
      
      // Suporte a teclado (Enter/Space)
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.useHistoryItem(item);
        }
      });
      
      this.historyList.appendChild(li);
    });
  }

  /**
   * Usa um item do histórico como valor atual
   */
  useHistoryItem(item) {
    this.currentOperand = item.result;
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = true;
    this.updateDisplay();
    
    // Scroll suave para o display
    this.display.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Animação de feedback
    this.showResultAnimation();
  }

  /**
   * Limpa todo o histórico
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.renderHistory();
  }

  /**
   * Salva o histórico no localStorage
   */
  saveHistory() {
    localStorage.setItem('calculator-history', JSON.stringify(this.history));
  }

  /**
   * Carrega o histórico salvo do localStorage
   */
  loadSavedHistory() {
    const savedHistory = localStorage.getItem('calculator-history');
    
    if (savedHistory) {
      try {
        this.history = JSON.parse(savedHistory);
      } catch (e) {
        this.history = [];
      }
    }
    
    this.renderHistory();
  }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Iniciar calculadora quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});
