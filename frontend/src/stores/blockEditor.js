import { defineStore } from "pinia";
import { BlocksManager } from "@/lib/BlocksManager.js";
import axios from "axios";

export const useBlockEditorStore = defineStore("block", {
  state: () => ({
    blocksManager: new BlocksManager()
  }),
  getters: {
    blocks: (state) => state.blocksManager.getBlocks(),
    buildTree: (state) => {
      const map = {};
      state.blocks.forEach(b => map[b.id] = {...b, children: []});
      const roots = [];
      state.blocks.forEach(b => {
        if (b.parent_id) map[b.parent_id].children.push(map[b.id]);
        else roots.push(map[b.id]);
      });
      function sortChildren(node) {
        node.children.sort((a,b) => a.order_index - b.order_index);
        node.children.forEach(sortChildren);
      }
      roots.forEach(sortChildren);
      return roots;
    }
  },
  actions: {
    createBlock(type, parent_id = null) {
      return this.blocksManager.createBlock(type, parent_id);
    },
    updateBlock(block) {
      this.blocksManager.updateBlock(block);
    },
    deleteBlock(id) {
      this.blocksManager.deleteBlock(id);
    },
    moveBlock(blockId, newParentId, newIndex) {
      this.blocksManager.reorderSiblings(newParentId, blockId, newIndex);
      const block = this.blocksManager.getBlockById(blockId);
      block.parent_id = newParentId;
      block.dirty = true;
    },
    async saveAllChanges() {
      const dirtyBlocks = this.blocksManager.getBlocks().filter(b => b.dirty);
      if (dirtyBlocks.length === 0) return;
      try {
        const res = await axios.put("/api/blocks/batch", { blocks: dirtyBlocks });
        // Reset dirty flags
        dirtyBlocks.forEach(b => (b.dirty = false));
      } catch (err) {
        console.error("Erreur lors de la sauvegarde", err);
      }
    }
  }
});
