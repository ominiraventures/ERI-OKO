package com.abelium.inatrace.db.entities.common;

import com.abelium.inatrace.api.types.Lengths;
import com.abelium.inatrace.db.base.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;

@Entity
public class GlobalSettings extends BaseEntity {
	
	/**
	 * Settings name
	 */
    @Column(length = Lengths.GLOBAL_SETTING_NAME, nullable = false, unique = true)
    private String name;
    
    /**
     * Settings value
     */
    @Lob
	@Column(columnDefinition = "LONGTEXT")
    private String value;
    
    /**
     * Can be accessed using public api
     */
    @Column
    private Boolean isPublic;
    
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public Boolean getIsPublic() {
		return isPublic;
	}

	public void setIsPublic(Boolean isPublic) {
		this.isPublic = isPublic;
	}
}
