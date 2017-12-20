package bryntum.crud.domain;

import org.codehaus.jackson.annotate.JsonProperty;


import java.util.List;

public abstract class Node extends General {
    protected Integer parentId;
    protected String phantomParentId;
    protected List<Node> children;
    protected Boolean expanded;
    protected Integer index;

    @JsonProperty("expanded")
    public Boolean getExpanded() {
        return expanded != null && expanded;
    }

    @JsonProperty("expanded")
    public void setExpanded(Boolean expanded) {
        this.expanded = expanded;
    }

    @JsonProperty("index")
    public Integer getIndex() {
        return index;
    }

    @JsonProperty("index")
    public void setIndex(Integer index) {
        this.index = index;
    }

    @Override
    public String getPhantomIdField() {
        return "PhantomId";
    }

    @JsonProperty("children")
    public List<Node> getChildren() {
        return children;
    }
    @JsonProperty("children")
    public void setChildren(List<Node> children) {
        this.children = children;
    }

    @JsonProperty("parentId")
    public Integer getParentId() {
        return parentId;
    }
    @JsonProperty("parentId")
    public void setParentId(Object parentId) {
        if (parentId == null) {
            this.parentId = null;
            return;
        }
        if (parentId instanceof String) {
            try {
                this.parentId = Integer.valueOf((String) parentId);
            } catch (NumberFormatException e) {
                this.parentId = null;
            }
        } else if (parentId instanceof Integer) {
            this.parentId = (Integer) parentId;
        }
    }

    @Override
    @JsonProperty("PhantomId")
    public String getPhantomId() {
        return phantomId;
    }
    @Override
    @JsonProperty("PhantomId")
    public void setPhantomId(String phantomId) {
        this.phantomId = phantomId;
    }

    @JsonProperty("PhantomParentId")
    public String getPhantomParentId() {
        return phantomParentId;
    }
    @JsonProperty("PhantomParentId")
    public void setPhantomParentId(String phantomParentId) {
        this.phantomParentId = phantomParentId;
    }

    @JsonProperty("leaf")
    public boolean getLeaf() {
        if (children == null) return true;

        return children.size() == 0;
    }
}
