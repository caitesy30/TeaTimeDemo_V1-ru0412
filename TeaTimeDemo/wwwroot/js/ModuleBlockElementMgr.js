
//================== 模塊 [ 名稱 ] 管理 ==================

class ModuleBlockElementMgr {

    static ModuleBlockName = "ModuleBlock";
    //------------------------------------
    static ModuleBlock_innerName = "ModuleBlock_inner";
    //-----------------------------------
    static TextBoxName = "textBox";
    static optionCheckboxName = "option_checkbox";
    //-----------------------------------
    static OnceTableName = "tableList";
    static TableGridName = "tableGrid";
    static TableFieldName = "table_Field";
    //-----------------------------------


    static checkIsModuleBlock(TargetModuleBlock) {

        if (!TargetModuleBlock) {
            console.log("目標不存在");
            return false;
        }

        if (TargetModuleBlock.nodeType !== 1) {
            console.log("目標不是DOM元素  " + TargetModuleBlock.id);
            return false;
        }

        // 检查是否包含某个 class
        if (!TargetModuleBlock.classList.contains(ModuleBlockElementMgr.ModuleBlockName)) {
            console.log("目標不是ModuleBlock元素");
            return false;
        }

        return true;
    }

    static checkIsTableField(targetTableField) {
        if (targetTableField.nodeType !== 1) {
            console.log("目標不是DOM元素");
            return false;
        }

        // 检查是否包含某个 class
        if (!targetTableField.classList.contains(ModuleBlockElementMgr.TableFieldName)) {
            console.log("目標不是TableField元素");
            return false;
        }

        return true;
    }
}








//================== 模塊 [ 獲取 ] 管理 ==================
class ModuleDataFetcherMgr {

    static GetTargetModuleBlock(TargetModuleBlockData) {
        var TargetModuleBlock = TargetModuleBlockData.closest("." + ModuleBlockElementMgr.ModuleBlockName)

        return TargetModuleBlock;
    }

    //-------------------------------------------------------------------------
    static GetTargetModuleBlock_Inner(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        return TargetModuleBlock.querySelector(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName}`);
    }

    //--------------------------------------------------------------------------
    static GetTargetModuleBlock_CheckBox(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        return TargetModuleBlock.querySelector(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TextBoxName} > .${ModuleBlockElementMgr.optionCheckboxName}`);
    }

    static GetTargetModuleBlock_TextBox(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        return TargetModuleBlock.querySelector(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TextBoxName}`);
    }
    //--------------------------------------------------------------------------

    static GetTargetModuleBlock_TextBoxLabel(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        return TargetModuleBlock.querySelector(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TextBoxName} > label`);
    }

    //--------------------------------------------------------------------------
    static GetTargetModuleBlock_TableGrid(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        return TargetModuleBlock.querySelector(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > table.${ModuleBlockElementMgr.TableGridName}`);
    }
    static GetTargetModuleBlock_OnceTable(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        return TargetModuleBlock.querySelector(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > table.${ModuleBlockElementMgr.OnceTableName}`);
    }

    //--------------------------------------------------------------------------

    static getAllChilds(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        var allModuleBlocks = TargetModuleBlock.querySelectorAll(
            `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName},
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName},
             
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.OnceTableName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName},
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.OnceTableName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName}`

        );

        return allModuleBlocks;
    }
    static getAllTableListChilds(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        var allModuleBlocks = TargetModuleBlock.querySelectorAll(
            `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.OnceTableName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName},
              :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.OnceTableName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName}`
        );

        return allModuleBlocks;
    }
    static getAllTableGridChilds(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        var allModuleBlocks = TargetModuleBlock.querySelectorAll(
            `:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName},
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName} > .${ModuleBlockElementMgr.ModuleBlockName}`
        );

        return allModuleBlocks;
    }

    //--------------------------------------------------------------------------
    static GetTargetModuleBlock_SixPointMoveBar(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        return TargetModuleBlock.querySelector(`:scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlock_MoveMgr.SixPointMoveBarName}`);
    }

    static GetTargetModuleBlock_ListTableField(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        var ListTableField = TargetModuleBlock.querySelector(
            `
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.OnceTableName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} ,
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.OnceTableName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName}
             `
        );

        return ListTableField;
    }

    static GetTargetModuleBlock_TableGridField(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        var ListTableField = TargetModuleBlock.querySelector(
            `
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} ,
             :scope > .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName}
             `
        );

        return ListTableField;
    }


    static GetTargetModuleBlock_TableGridField(TargetModuleBlock) {
        if (!ModuleBlockElementMgr.checkIsModuleBlock(TargetModuleBlock)) {
            return null;
        }
        var ListTableField = TargetModuleBlock.querySelector(
            `
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tr > td > .${ModuleBlockElementMgr.TableFieldName} ,
             .${ModuleBlockElementMgr.ModuleBlock_innerName} > .${ModuleBlockElementMgr.TableGridName} > tbody > tr > td > .${ModuleBlockElementMgr.TableFieldName}
             `
        );

        return ListTableField;
    }

    //label
}