class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  // تسجيل خدمة
  register(name, factory, isSingleton = false) {
    this.services.set(name, { factory, isSingleton });
  }

  // حل التبعية
  resolve(name) {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Service '${name}' not registered`);
    }

    // إذا كان singleton وتم إنشاؤه من قبل
    if (service.isSingleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // إنشاء الخدمة
    const instance = service.factory(this);

    // إذا كان singleton، احفظه
    if (service.isSingleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  // تسجيل singleton
  registerSingleton(name, factory) {
    this.register(name, factory, true);
  }

  // مسح جميع الخدمات
  clear() {
    this.services.clear();
    this.singletons.clear();
  }
}

module.exports = DIContainer; 