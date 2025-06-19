package com.abelium.inatrace.tools;

import com.abelium.inatrace.tools.queries.AliasCondition;
import com.abelium.inatrace.tools.queries.SimpleQueryBuilder;
import jakarta.persistence.EntityManager;
import org.torpedoquery.jakarta.jpa.OnGoingLogicalCondition;
import org.torpedoquery.jakarta.jpa.Torpedo;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public class Queries
{
    // for BaseEntity (to automatically convert int -> long if needed)
    public static <T> T get(EntityManager em, Class<T> cls, long id) {
        return em.find(cls, id);
    }
    
    public static <T> T get(EntityManager em, Class<T> cls, Object id) {
        if (id == null) return null;
        return em.find(cls, id);
    }
    
    public static <T> List<T> getAll(EntityManager em, Class<T> cls) {
        T alias = Torpedo.from(cls);
        return Torpedo.select(alias).list(em);
    }
    
    public static <T, P> T getUniqueBy(EntityManager em, Class<T> cls, Function<T, P> property, P value) {
        if (value == null) return null;
        T alias = Torpedo.from(cls);
        Torpedo.where(property.apply(alias)).eq(value);
        Optional<T> result = Torpedo.select(alias).get(em);
        return result.orElse(null);
    }

    public static <T, P> T getFirstBy(EntityManager em, Class<T> cls, Function<T, P> property, P value) {
        if (value == null) return null;
        T alias = Torpedo.from(cls);
        Torpedo.where(property.apply(alias)).eq(value);
        List<T> results = Torpedo.select(alias).setMaxResults(1).list(em);
        return results.isEmpty() ? null : results.get(0);
    }

    public static <T, P> List<T> getAllBy(EntityManager em, Class<T> cls, Function<T, P> property, P value) {
        if (value == null) return Collections.emptyList();
        T alias = Torpedo.from(cls);
        Torpedo.where(property.apply(alias)).eq(value);
        return Torpedo.select(alias).list(em);
    }

    public static <T, P> List<T> getAllWherePropIn(EntityManager em, Class<T> cls, Function<T, P> property, Collection<P> values) {
        if (values == null || values.isEmpty()) return Collections.emptyList();
        T alias = Torpedo.from(cls);
        Torpedo.where(property.apply(alias)).in(values);
        return Torpedo.select(alias).list(em);
    }
    
    public static <T, P> int getCountBy(EntityManager em, Class<T> cls, Function<T, P> property, P value) {
        if (value == null) return 0;
        T alias = Torpedo.from(cls);
        Torpedo.where(property.apply(alias)).eq(value);
        Optional<Long> result = Torpedo.select(Torpedo.count(alias)).get(em);
        return result.isPresent() ? result.get().intValue() : 0;
    }
    
    // generic versions
    
    public static OnGoingLogicalCondition condition() {
        return Torpedo.condition();
    }
    
    public static <T> T getUniqueWhere(EntityManager em, Class<T> cls, AliasCondition<T> condition) {
        T alias = Torpedo.from(cls);
        Torpedo.where(condition.evaluate(alias));
        Optional<T> result = Torpedo.select(alias).get(em);
        return result.orElse(null);
    }

    public static <T> T getFirstWhere(EntityManager em, Class<T> cls, AliasCondition<T> condition) {
        T alias = Torpedo.from(cls);
        Torpedo.where(condition.evaluate(alias));
        List<T> results = Torpedo.select(alias).setMaxResults(1).list(em);
        return results.isEmpty() ? null : results.get(0);
    }
    
    public static <T> List<T> getAllWhere(EntityManager em, Class<T> cls, AliasCondition<T> condition) {
        T alias = Torpedo.from(cls);
        Torpedo.where(condition.evaluate(alias));
        return Torpedo.select(alias).list(em);
    }
    
    public static <T> int getCountWhere(EntityManager em, Class<T> cls, AliasCondition<T> condition) {
        T alias = Torpedo.from(cls);
        Torpedo.where(condition.evaluate(alias));
        Optional<Long> result = Torpedo.select(Torpedo.count(alias)).get(em);
        return result.isPresent() ? result.get().intValue() : 0;
    }
    
    // builder
    
    /**
     * Return a {@link SimpleQueryBuilder} for given class.
     * See examples in {@code SimpleQueryTests}.
     * @param em the entity manager to use
     * @param entityClass the entityClass (no collection joins are supported) 
     * @return a {@link SimpleQueryBuilder}
     */
    public static <T> SimpleQueryBuilder<T> from(EntityManager em, Class<T> entityClass) {
        return new SimpleQueryBuilder<>(em, entityClass);
    }
}
