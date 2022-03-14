const ERRORS = {
  INVALID_INPUT:
    "Um ou mais valores estão inválidos. Insira valores válidos para realizar o cálculo corretamente.",
  VALUES_NOT_DECLARED:
    "Nenhum valor foi informado, preencha os campos corretamente.",
};

class Validator {
  static validate(valuesObject) {
    if (valuesObject.length === 0) {
      throw new Error(ERRORS.VALUES_NOT_DECLARED);
    }

    const newValuesObject = {};
    const valuesArray = Object.entries(valuesObject);

    const isInvalid = valuesArray.some((value) => {
      const floatValue = parseFloat(
        value[1].replace(/\./g, "").replace(/,/g, "")
      );
      const isNaN = Number.isNaN(floatValue);
      const isNegative = Number(floatValue) < 0;

      return isNaN || isNegative;
    });

    if (isInvalid) throw new Error(ERRORS.INVALID_INPUT);

    valuesArray.forEach((valueEntry) => {
      return (newValuesObject[valueEntry[0]] = valueEntry[1]
        .replace(/\./g, "")
        .replace(/,/g, "."));
    });

    return newValuesObject;
  }
}

class Formmater {
  static format(valuesObject) {
    const newValuesObject = {};
    const valuesArray = Object.entries(valuesObject);

    const formmatedValues = valuesArray.map((value) => {
      return parseFloat(String(value[1]).replace(",", "."));
    });

    valuesArray.forEach((valueEntry, index) => {
      return (newValuesObject[valueEntry[0]] = formmatedValues[index]);
    });

    return newValuesObject;
  }

  static transformToReal(value) {
    return Intl.NumberFormat("pt-br", {
      currency: "brl",
      style: "currency",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  }

  static monthToYearPercentage(yearlyPercentage) {
    return ((Math.pow(yearlyPercentage / 100 + 1, 1 / 12) - 1) * 100).toFixed(
      2
    );
  }

  static yearToMonthPercentage(monthlyPercentage) {
    return ((Math.pow(1 + monthlyPercentage / 100, 12) - 1) * 100).toFixed(2);
  }
}

class CompoundInterestsCalculator {
  constructor({ resultsInterval, ...compoundInterestNecessaryValues }) {
    if (resultsInterval === "invalid") {
      alert(ERRORS.INVALID_INPUT);
      throw new Error(ERRORS.INVALID_INPUT);
    }
    this.valuesObject = compoundInterestNecessaryValues;
    this.resultsInterval = resultsInterval;
    this.total = {
      totalResult: 0,
      totalInvested: 0,
      totalInterests: 0,
    };
    this.#populateValuesObject();
  }

  #populateValuesObject() {
    try {
      const validatedValues = Validator.validate(this.valuesObject);
      const {
        initialValue,
        interestRate,
        growthRate,
        capitalInjection,
        totalPeriod,
      } = Formmater.format(validatedValues);

      this.initialValue = initialValue;
      this.interestRate =
        this.resultsInterval === "yearly"
          ? Formmater.monthToYearPercentage(interestRate) / 100
          : interestRate / 100;
      this.growthRate = growthRate / 100;
      this.capitalInjection = capitalInjection;
      this.totalPeriod =
        this.resultsInterval === "yearly" ? totalPeriod * 12 : totalPeriod;
    } catch (error) {
      alert(error.message);
    }
  }

  calculate() {
    let value = this.initialValue;

    let totalInvested = value;

    for (let i = 1; i <= this.totalPeriod; i++) {
      const rate =
        this.resultsInterval === "monthly"
          ? this.interestRate / 100
          : this.interestRate;
      const interest = 1 + rate;
      const valueWithInterest = value * interest;
      value = valueWithInterest + this.capitalInjection;

      totalInvested = totalInvested + this.capitalInjection;

      if (i % 12 === 0 && i > 0) {
        this.capitalInjection =
          this.capitalInjection + this.capitalInjection * this.growthRate;
      }

      if (i == this.totalPeriod) {
        this.total.totalInterests = Formmater.transformToReal(
          value - totalInvested
        );
        this.total.totalInvested = Formmater.transformToReal(totalInvested);
        this.total.totalResult = Formmater.transformToReal(value);
      }
    }
  }
}

class EventCreator {
  constructor({
    initialValueInput,
    interestRateInput,
    growthRateInput,
    capitalInjectionInput,
    totalPeriodInput,
    cleanButton,
    calculateButton,
    resultsInterval,
    totalInterests,
    totalInvested,
    totalResult,
  }) {
    this.initialValueInput = initialValueInput;
    this.interestRateInput = interestRateInput;
    this.growthRateInput = growthRateInput;
    this.capitalInjectionInput = capitalInjectionInput;
    this.totalPeriodInput = totalPeriodInput;
    this.cleanButton = cleanButton;
    this.calculateButton = calculateButton;
    this.resultsInterval = resultsInterval;
    this.totalInterests = totalInterests;
    this.totalInvested = totalInvested;
    this.totalResult = totalResult;
    this.firstResultIntervalChange = true;
  }

  start() {
    const initialValue = document.querySelector(`#${this.initialValueInput}`);
    const interestRate = document.querySelector(`#${this.interestRateInput}`);
    const growthRate = document.querySelector(`#${this.growthRateInput}`);
    const capitalInjection = document.querySelector(
      `#${this.capitalInjectionInput}`
    );
    const totalPeriod = document.querySelector(`#${this.totalPeriodInput}`);
    const resultsInterval = document.querySelector(`#${this.resultsInterval}`);
    const calculateButton = document.querySelector(`#${this.calculateButton}`);
    const cleanButton = document.querySelector(`#${this.cleanButton}`);
    const totalInterests = document.querySelector(`#${this.totalInterests}`);
    const totalInvested = document.querySelector(`#${this.totalInvested}`);
    const totalResult = document.querySelector(`#${this.totalResult}`);

    totalInterests.innerText = Formmater.transformToReal(0);
    totalInvested.innerText = Formmater.transformToReal(0);
    totalResult.innerText = Formmater.transformToReal(0);

    const loadMasks = (
      initialValue = this.initialValueInput,
      capitalInjection = this.capitalInjectionInput,
      interestRate = this.interestRateInput,
      growthRate = this.growthRateInput
    ) =>
      (function () {
        jQuery(`#${initialValue}`).maskMoney({
          thousands: ".",
          decimal: ",",
          allowZero: true,
        });
        jQuery(`#${capitalInjection}`).maskMoney({
          thousands: ".",
          decimal: ",",
          allowZero: true,
        });

        jQuery(`#${interestRate}`).maskMoney({
          thousands: "",
          decimal: ",",
          allowZero: true,
        });
        jQuery(`#${growthRate}`).maskMoney({
          thousands: "",
          decimal: ",",
          allowZero: true,
        });
      })();
    jQuery(loadMasks());

    let lastResultInterval = resultsInterval.value;
    resultsInterval.addEventListener("change", (event) => {
      const periodSpan = document.querySelector(`.period-span`);
      const interestSpan = document.querySelector(`.interest-span`);

      if (resultsInterval.value == "yearly") {
        periodSpan.innerText = "Tempo de investimento anual";
        interestSpan.innerText = "Taxa anual de juros";
      }

      if (resultsInterval.value == "monthly") {
        periodSpan.innerText = "Tempo de investimento mensal";
        interestSpan.innerText = "Taxa mensal de juros";
      }

      if (
        resultsInterval.value === "yearly" &&
        !this.firstResultIntervalChange &&
        lastResultInterval != resultsInterval.value
      ) {
        interestRate.value = Formmater.yearToMonthPercentage(
          Number(interestRate.value.replace(",", "."))
        );

        totalPeriod.value = totalPeriod.value / 12;
      }

      if (
        resultsInterval.value === "monthly" &&
        !this.firstResultIntervalChange &&
        lastResultInterval != resultsInterval.value
      ) {
        interestRate.value = Formmater.monthToYearPercentage(
          Number(interestRate.value.replace(",", "."))
        );

        totalPeriod.value = totalPeriod.value * 12;
      }

      this.firstResultIntervalChange = false;
      lastResultInterval = resultsInterval.value;
    });

    calculateButton.addEventListener("click", (event) => {
      const compoundInterestsCalculator = new CompoundInterestsCalculator({
        initialValue: initialValue.value,
        interestRate: interestRate.value,
        growthRate: growthRate.value,
        capitalInjection: capitalInjection.value,
        totalPeriod: totalPeriod.value,
        resultsInterval: resultsInterval.value,
      });

      compoundInterestsCalculator.calculate();

      totalInterests.innerText =
        compoundInterestsCalculator.total.totalInterests;
      totalInvested.innerText = compoundInterestsCalculator.total.totalInvested;
      totalResult.innerText = compoundInterestsCalculator.total.totalResult;
    });

    cleanButton.addEventListener("click", (event) => {
      initialValue.value = 0;
      interestRate.value = 0;
      growthRate.value = 0;
      capitalInjection.value = 0;
      totalPeriod.value = 0;
      totalInterests.innerText = Formmater.transformToReal(0);
      totalInvested.innerText = Formmater.transformToReal(0);
      totalResult.innerText = Formmater.transformToReal(0);
    });
  }
}

const eventCreator = new EventCreator({
  calculateButton: "calculate-button",
  capitalInjectionInput: "capital-injection-input",
  cleanButton: "clean-button",
  growthRateInput: "growth-rate-input",
  initialValueInput: "initial-value-input",
  interestRateInput: "interest-rate-input",
  resultsInterval: "results-interval",
  totalPeriodInput: "total-period-input",
  totalInterests: "total-interests",
  totalInvested: "total-invested",
  totalResult: "total-result",
});

eventCreator.start();
