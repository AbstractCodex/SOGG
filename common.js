// Common functions

const NL = String.fromCharCode(13, 10);

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function hanitize(_s) {
    let s = _s.replaceAll('<','&lt;');
    s = s.replaceAll('>','&gt;');
    s = s.replaceAll('"','’');
    s = s.replaceAll('`','’');
    s = s.replaceAll('\'','’');    
    return s;
}

function has_member(_obj, _member) {
    if (!_obj || !_member)
        return false;
    if (!_obj.hasOwnProperty(_member))
        return false
    return true;
}

function capitalize(_str_in) {
    if (!_str_in || _str_in.length<=0) {
        return _str_in;
    }
    if (_str_in.length === 1) {
        return _str_in.toUpperCase();
    }
    let rest = _str_in.substring(1);
    let first_letter = _str_in.substring(0,1).toUpperCase();
    return first_letter + rest;
}

function decapitalize(_str_in) {
    if (!_str_in || _str_in.length<=0) {
        return _str_in;
    }
    if (_str_in.length === 1) {
        return _str_in.toLowerCase();
    }
    let rest = _str_in.substring(1);
    let first_letter = _str_in.substring(0,1).toLowerCase();
    return first_letter + rest;
}


/**
 * Add a string val to item in set or map or json object (_set).
 * If _item does not exist in _set, then create _item in _set before setting val.
 * @param {set or map or object} _set The container
 * @param {any} _item The member of _set
 * @param {string} _val The value to set for _item. Will be trimmed.
 */
function create_or_append_array_in_map_with_simple(_set, _item, _val) {
    let val = _val;
    let item = _item.trim();
    if (typeof(_val) == 'string') {
        val = val.trim();
    }
    if (!_set.hasOwnProperty(item)) {
        _set[item] = [val];
    } else {
        let arr = _set[item];
        if (arr.length <= 0) {
            _set[item] = [val];
        } else {
            let has_already = false;
            for (let i=0; i<arr.length; i++) {
                if (arr[i] == val) {
                    has_already = true;
                    break;
                }
            }
            if (!has_already) {
                _set[item].push(val);
            }
        }
    }
}

/**
 * Add an member (_item) to a set or map or json object (_set) with the value of _val.
 * If _item does not exist in _set, then create _item in _set before setting val.
 * @param {set or map or object} _set The container
 * @param {any} _item The member of _set
 * @param {string or array} _val The value to set for _item. Will be trimmed.
 */
function create_or_append_array_in_map(_set, _item, _val) {
    if (typeof(_val) == 'string' || typeof(_val) == 'number' || typeof(_val) == 'boolean') {
        return create_or_append_array_in_map_with_simple(_set, _item, _val);
    }
    if (typeof(_val) == 'object') {
        for (let i=0; i<_val.length; i++) {
            create_or_append_array_in_map_with_simple(_set, _item, _val[i]);
        }
    }
}

/**
 * Convert from markdownish string data to json format
 * The JSON format as a single list of subjects can encompass all of the data
 * @param {string} _md 
 * @return json object rep of all the data
 */
function md_to_json(_md) {
    let lines = _md.split("\n");

    // We will only add a category if there is at least 1 subject in that category
    let category = "Uncategorized";
    let subject = "";
    let entry = new Object();
    entry.reln = {};
    let entries = {};
    let prev_subj = null;

    for (let line of lines) {
        let new_cat = false;
        let new_subj = false;
    
        if (line === null || line.length<=0) {            
            continue;
        }
        line = line.trim();
        if (line.startsWith("//")) {
            // This is a comment
            continue;
        }

        if (line.startsWith("# ")) {
            // This is a category!
            category = line.substring(2).trim();            
            new_cat = true;
        } else if (line.startsWith("## ")) {
            // This is a new subject definition!
            subject = line.substring(3).trim();
            if (!subject || (subject.length < 0)) {
                subject = "Unnamed";                
            }                    
            new_subj = true;
        }

        if (new_cat || new_subj) {
            // If we have a new entity, we must save the old and reset, but only if this is not the first subj
            if (entry && entry.hasOwnProperty("name") && entry.name.length>0 && entry.name != prev_subj) {
                entries[entry.name] = entry;
                prev_subj = entry.name;
            }
            entry = null;
            entry = new Object();
            entry.type = category;
            entry.name = subject;
            entry.reln = {};
        } else {
            let at_colon = line.indexOf(':');            
            if (at_colon<0) {
                // If we have a line that has no colon, then it is a description
                entry.descript = line.trim();
                continue;                
            } else {
                // Relationship or special entry
                let conx = hanitize(line.substring(0,at_colon).trim()).toLowerCase();
                let obj = hanitize(line.substring(at_colon+1).trim());
                if (conx.startsWith("prompt_")) {
                    entry[conx] = obj;
                } else {
                    switch (conx) {
                        case "img":
                            entry.img = obj;
                            break;
                        
                        case "sex":
                            entry.sex = obj;
                            break;

                        default:
                            arr_obj = obj.split(',');
                            create_or_append_array_in_map(entry.reln, conx, arr_obj);
                    }
                }
            }
        }
    }
    // Add the final subject entry
    if (entry && entry.hasOwnProperty("name")) {
        entries[entry.name] = entry;
        entry = null;
    }
    return entries;
}
